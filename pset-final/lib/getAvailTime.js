const scheduler = require('./scheduler');
const axios = require('axios');

async function getAvailTimes(schedules, duration) {

    /* 
        Sample Input 
            schedules: [
                [[bStart, bEnd], [[meeting1Start, meeting1End], [meeting2Start, meeting2End], [meeting1Start, meeting1End]]],
                [[bStart, bEnd], [[meeting1Start, meeting1End], [meeting2Start, meeting2End], [meeting1Start, meeting1End]]],
                [[bStart, bEnd], [[meeting1Start, meeting1End], [meeting2Start, meeting2End], [meeting1Start, meeting1End]]]
            ]
        
    */
    // var input = `{
    //     "test": "asd",
    //     "schedules": [
    //         [["8:10","18:30"],[["8:51","11:34"],["12:51","14:27"],["15:55","17:13"],["17:48","18:18"]]],
    //         [["7:00","17:45"],[["7:55","10:00"],["11:30","14:00"],["15:15","16:30"]]],
    //         [["7:00","17:45"],[["7:55","10:00"],["11:30","14:00"],["15:15","16:30"]]]
    //     ]
    // }`

    try {

        var data = []

        schedules.forEach(async (schedule) => {

            var sch = (schedule.sch)

            var bounds = sch[0]
            var meetings = sch[1]

            var req = await axios.get('http://worldtimeapi.org/api/timezone/' + schedule.tz);
            var tz = req.data.utc_offset;

            data.push({
                bounds,
                meetings,
                timezone: tz
            })
            
        });
        
        var returnedData = data;
        var tzReq = await axios.get('http://worldtimeapi.org/api/timezone/' + schedules[0].tz)
        var timezone = tzReq.data.utc_offset
        var dataLength = 0;
        
        while (dataLength !== 1) {
            
            returnedData = recursiveFunc(returnedData, timezone);

            dataLength = returnedData.length;
            
        }

        var freeSlots = scheduler.getFreeTimes(returnedData[0].meetings, duration, returnedData[0].bounds);
        
        return {
            msg: 'SUCCESS',
            freeSlots,
            schedule: [returnedData[0].bounds, returnedData[0].meetings]
        }
        
    } catch (err) {
        
        return {
            msg: 'ERROR',
            error: err 
        }
        
    }

}

function recursiveFunc(data, timezone) {

    try {
        
        console.log(data)

        var len = data.length;

        var newData = [];

        for (let i = 0; i < len; i += 2) {
            
            var sch = data[i].meetings;
            var bounds = data[i].bounds;
            console.log(bounds, sch)

            var tzOffset = timezoneDiff(timezone, data[i].timezone);
            // console.log(tzOffset)
            // console.log(timezone, data[i].timezone)

            bounds = [changeTimezone(bounds[0], tzOffset), changeTimezone(bounds[1], tzOffset)]

            sch.forEach((meeting, index) => {
                sch[index] = [changeTimezone(meeting[0], tzOffset), changeTimezone(meeting[1], tzOffset)]
            });

            console.log(bounds, sch)

            if (len % 3 === 0 && i === len - 1) {
                newData.push({
                    bounds,
                    meetings: sch
                })
                continue;
            }
            
            var schNext = data[i+1].meetings;
            var boundsNext = data[i+1].bounds;
            console.log(boundsNext, schNext)

            var tzOffsetNext = timezoneDiff(timezone, data[i+1].timezone);
            // console.log(tzOffsetNext)
            // console.log(timezone, data[i+1].timezone)

            boundsNext = [changeTimezone(boundsNext[0], tzOffsetNext), changeTimezone(boundsNext[1], tzOffsetNext)]

            schNext.forEach((meeting, index) => {
                schNext[index] = [changeTimezone(meeting[0], tzOffsetNext), changeTimezone(meeting[1], tzOffsetNext)]
            });

            console.log(boundsNext, schNext)

            var mergedBounds = scheduler.mergeBounds(bounds, boundsNext);
            var mergedSch = scheduler.mergeSchedules(mergedBounds, sch, schNext);

            newData.push({
                bounds: mergedBounds,
                meetings: mergedSch
            })
        }

        return newData;
        
    } catch (error) {
        throw error;
    }
    
}

function timezoneDiff(tz1, tz2) {

    var dir1 = parseInt(tz1[0] + 1)
    var dir2 = parseInt(tz2[0] + 1)
    
    var [h1, m1] = tz1.slice(1).split(':');
    var [h2, m2] = tz2.slice(1).split(':');

    tz1 = dir1 * (parseInt(h1) * 60 + parseInt(m1));
    tz2 = dir2 * (parseInt(h2) * 60 + parseInt(m2));
    
    return tz1 - tz2

}

function changeTimezone(time, tzOffset) {
    
    var [h, m] = time.split(':');
    time = parseInt(h) * 60 + parseInt(m);

    var newTime = time + tzOffset;

    var [newH, newM] = [Math.floor(newTime / 60), newTime % 60]

    return newH + ':' + (newM < 10 ? '0' + newM : newM);

}

module.exports = getAvailTimes