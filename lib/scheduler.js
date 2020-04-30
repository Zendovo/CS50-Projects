// Sample Inputs

// schedule1 = [['10:00', '12:00'], ['13:00', '14:00'], ['14:30', '17:00'], ['17:30', '18:00']]
// bounds1 = ['8:30', '20:00']

// schedule2 = [['9:30', '13:30'], ['13:45', '15:00'], ['18:00', '18:30']]
// bounds2 = ['9:00', '19:00']


module.exports = {

    mergeBounds: (bounds1, bounds2) => {

        var mergedBounds = [];

        if (module.exports.compareTimes(bounds1[0], bounds2[0]) === 1) {
            mergedBounds.push(bounds1[0]);
        } else {
            mergedBounds.push(bounds2[0]);
        }

        if (module.exports.compareTimes(bounds1[1], bounds2[1]) === -1) {
            mergedBounds.push(bounds1[1]);
        } else {
            mergedBounds.push(bounds2[1]);
        }

        return mergedBounds;

    },

    mergeSchedules: (bounds, sch1, sch2) => {

        var mergedSch = [];

        // Indices/pointers for schedule1 and schedule2
        var p1 = 0;
        var p2 = 0;

        // Combine both the schedules in sorted manner
        while (p1 < sch1.length || p2 < sch2.length) {
            
            // If p1 is at the end of the list push the rest of the time slots
            if (p1 === sch1.length) {
                mergedSch.push(sch2[p2]);
                p2++;

            // If p2 is at the end of the list push the rest of the time slots
            } else if(p2 === sch2.length) {
                mergedSch.push(sch1[p1]);
                p1++;
                
            // Determine the time slot starting earlier and push to list
            } else if(module.exports.compareTimes(sch1[p1][0], sch2[p2][0]) === -1) {
                mergedSch.push(sch1[p1]);
                p1++;
                
            } else {
                mergedSch.push(sch2[p2]);
                p2++;

            }
        }

        // Merge the overlapping time slots
        var i = 0;
        while (i + 1 < mergedSch.length) {

            var end1 = mergedSch[i][1];
            var start2 = mergedSch[i + 1][0];

            // If end1 > start2
            if (module.exports.compareTimes(end1, start2) != -1) {

                // The entry overlaps

                var end2 = mergedSch[i + 1][1];

                // Check if end1 > end2
                if (module.exports.compareTimes(end1, end2) === 1) {

                    // The entire slot wraps inside the previous one
                    // Remove the entry which wraps inside and move to the next entry

                    mergedSch.splice(i + 1, 1);
                    
                } else {

                    // Only part of the time slot overlaps
                    // Merge the two entries

                    mergedSch[i][1] = end2;
                    mergedSch.splice(i + 1, 1);
                    
                }
                
            } else {

                // Thr entry does not overlap
                // Move to the next entry

                i++;
                
            }
            
        }

        // Fix the entries as per the start bounds
        var i = 0;
        while (i < mergedSch.length) {

            var timeSlot = mergedSch[i];
            var start = bounds[0];

            // Check if the entry is earlier than the bounds
            if (module.exports.compareTimes(timeSlot[0], start) === -1) {
                
                if (module.exports.compareTimes(timeSlot[1], start) === 1) {
                    timeSlot[0] = start;
                    
                } else {
                    mergedSch.splice(i, 1);

                }

                i++;

            } else {
                break;
                
            }
            
        }

        // Fix the entries as per the end bounds
        var i = mergedSch.length - 1;
        while (i > -1) {

            var timeSlot = mergedSch[i];
            var end = bounds[1];

            // Check if the entry is later than the bounds
            if (module.exports.compareTimes(timeSlot[1], end) === 1) {

                if (module.exports.compareTimes(timeSlot[0], end) === -1) {
                    timeSlot[1] = end;
                    
                } else {
                    mergedSch.splice(i, 1);
                    
                }

                i--;
                
            } else {
                break;
            }
            
        }

        return mergedSch;

    },

    getFreeTimes: (schedule, duration, bounds) => {

        var freeTimes = [];
        var schLen = schedule.length;

        var startBound = bounds[0];

        // Check if there is any free time slot between the bound and first entry
        if (module.exports.diffBetweenTimes(schedule[0][0], startBound) >= duration) {
            var timeSlot = [startBound, schedule[0][0]];
            freeTimes.push(timeSlot);
        }

        // Find free time slots of duration
        var i = 0;
        while (i < schLen - 1) {
            
            var end1 = schedule[i][1];
            var start2 = schedule[i + 1][0];

            // Check if the time between two entries is enough
            if (module.exports.diffBetweenTimes(start2, end1) >= duration) {
                var timeSlot = [end1, start2];
                freeTimes.push(timeSlot);
                
            } 
            
            i++;
        }

        var endBound = bounds[1];

        // Check if there are any free time slots between the bound and last entry
        if (module.exports.diffBetweenTimes(endBound, schedule[schLen - 1][1]) >= duration) {
            var timeSlot = [schedule[schLen - 1][1], endBound];
            freeTimes.push(timeSlot);
            
        }

        return freeTimes;
    },

    compareTimes: (t1, t2) => {

        // Split the hour and the minute
        var [h1, m1] = t1.split(':');
        var [h2, m2] = t2.split(':');

        // Determine the total number of minutes
        // To make performing calculations easy
        t1 = parseInt(h1) * 60 + parseInt(m1);
        t2 = parseInt(h2) * 60 + parseInt(m2);

        if (t1 < t2) {
            return - 1;
        } else if (t1 > t2) {
            return 1;            
        } else {
            return 0;
        }
    },

    diffBetweenTimes: (t1, t2) => {

        // Split the hour and the minute
        var [h1, m1] = t1.split(':');
        var [h2, m2] = t2.split(':');

        // Determine the total number of minutes
        // To make performing calculations easy
        t1 = parseInt(h1) * 60 + parseInt(m1);
        t2 = parseInt(h2) * 60 + parseInt(m2);

        return Math.abs(t1 - t2);

    }

};