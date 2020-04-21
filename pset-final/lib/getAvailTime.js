const scheduler = require('./scheduler');

function getAvailTimes(schedules, duration) {

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

        schedules.forEach(schedule => {

            schedule = (schedule)

            var bounds = schedule[0]
            var meetings = schedule[1]

            data.push({
                bounds,
                meetings
            })
            
        });
        
        var returnedData = data;
        var dataLength = 0;
        
        while (dataLength !== 1) {
            
            returnedData = recursiveFunc(returnedData);

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

function recursiveFunc(data) {

    try {

        var len = data.length;

        var newData = [];

        for (let i = 0; i < len; i += 2) {
            
            sch = data[i].meetings;
            bounds = data[i].bounds;

            if (len % 3 === 0 && i === len - 1) {
                newData.push({
                    bounds,
                    meetings: sch
                })
                continue;
            }
            
            schNext = data[i+1].meetings;
            boundsNext = data[i+1].bounds;

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

module.exports = getAvailTimes