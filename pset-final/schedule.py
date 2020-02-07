

# Sample Inputs

# schedule1 = [['10:00', '12:00'], ['13:00', '14:00'], ['14:30', '17:00'], ['17:30', '18:00']]
# bounds1 = ['8:30', '20:00']

# schedule2 = [['9:30', '13:30'], ['13:45', '15:00'], ['18:00', '18:30']]
# bounds2 = ['9:00', '19:00']

# duration = 30


def mergeBounds(bounds1, bounds2):
    """Returns the merged bounds of the schedules
    
    Arguments:
        bounds1 {list} -- Time span of the schedule
        bounds2 {list} -- Time span of the schedule
    
    Returns:
        list -- Merged Time span
    """
    

    mergedBounds = []

    # Compare start bounds
    if compareTimes(bounds1[0], bounds2[0]) == 1:
        mergedBounds.append(bounds1[0])
    else:
        mergedBounds.append(bounds2[0])

    # Compare end bounds
    if compareTimes(bounds1[1], bounds2[1]) == 1:
        mergedBounds.append(bounds2[1])
    else:
        mergedBounds.append(bounds1[1])

    return mergedBounds


def mergeSchedules(newBounds, sch1, sch2):
    """Merge the the schedules with the new bounds
    
    Arguments:
        newBounds {list} -- The bounds (merged) of the schedules
        sch1 {list} -- A list of time spans containing booked timings of schedule
        sch2 {list} -- A list of time spans containing booked timings of schedule
    
    Returns:
        list -- A list of time spans containing booked time slots of both schedules
    """

    mergedSch = []

    # Indices/pointers for schedule1 and schedule2
    p1 = 0
    p2 = 0

    # Combine both the schedules sorted
    while p1 < len(sch1) or p2 < len(sch2):

        # If p1 is at the end of the list append the rest time slots
        if p1 == len(sch1):
            mergedSch.append(sch2[p2])
            p2 += 1

        # If p2 is at the end of the list append the rest time slots
        elif p2 == len(sch2):
            mergedSch.append(sch1[p1])
            p1 += 1

        # Determine the time slot starting earlier and append
        elif compareTimes(sch1[p1][0], sch2[p2][0]) == -1:
            mergedSch.append(sch1[p1])
            p1 += 1
        
        else:
            mergedSch.append(sch2[p2])
            p2 += 1

    # Merge the overlapping time slots
    i = 0
    while i + 1 < len(mergedSch):
        
        end1 = mergedSch[i][1]
        start2 = mergedSch[i + 1][0]

        # If end1 < start2
        if compareTimes(end1, start2) != -1:

            # The entry overlaps

            end2 = mergedSch[i + 1][1]
            
            # Check if end1 > end2
            if compareTimes(end1, end2) == 1:

                # The entire time slot wraps inside the previous one
                # Remove the entry which wraps inside and move to the next entry

                mergedSch.pop(i + 1)

            else:

                # Only part of the time slot overlaps
                # Merge the two entries

                mergedSch[i][1] = end2
                mergedSch.pop(i + 1)
        
        else:

            # The entry does not overlap
            # Move to the next entry

            i += 1

    # Fix the entries as per the start bounds
    j = 0
    while j < len(mergedSch):

        timeSlot = mergedSch[j]
        start = newBounds[0]

        # Check if the entry is earlier than the bounds
        if compareTimes(timeSlot[0], start) == -1:

            if compareTimes(timeSlot[1], start) == 1:
                timeSlot[0] = start
            else:
                mergedSch.pop(j)
            j += 1

        else:
            break

    # Fix the entries as per the end bounds
    j = len(mergedSch) - 1
    while j > -1:

        timeSlot = mergedSch[j]
        end = newBounds[1]

        # Check if the entry is later than the bounds
        if compareTimes(timeSlot[1], end) == 1:

            if compareTimes(timeSlot[0], end) == -1:
                timeSlot[1] = end
            else:
                mergedSch.pop(j)
            j -= 1

        else:
            break

    return mergedSch


def getFreeTimes(schedule, duration, bounds):
    """Returns the free time slots of duration in the the schedule
    
    Arguments:
        schedule {list} -- List of booked time spans
        duration {int} -- Duration of free time slots (in minutes)
        bounds {list} -- The bounds of the schedule
    
    Returns:
        list -- List of free time slots
    """

    freeTimes = []
    schLen = len(schedule)

    startBound = bounds[0]

    # Check if there is any free time slot between the bound and first entry
    if diffBetweenTimes(schedule[0][0], startBound) >= duration:
        timeSlot = [startBound, schedule[0][0]]
        freeTimes.append(timeSlot)

    # Find free time slots of duration
    i = 0
    while i < schLen - 1:

        end1 = schedule[i][1]
        start2 = schedule[i + 1][0]

        # Check if the time between two entries is enough
        if diffBetweenTimes(start2, end1) >= duration:
            timeSlot = [end1, start2]
            freeTimes.append(timeSlot)

        i += 1

    endBound = bounds[1]

    # Check if there is any free time slot between the bound and last entry
    if diffBetweenTimes(endBound, schedule[schLen - 1][1]) >= duration:
        timeSlot = [schedule[schLen - 1][1], endBound]
        freeTimes.append(timeSlot)

    return freeTimes


def compareTimes(t1, t2):
    """Compares times and returns -1, 0 or 1
    -1 : t1 < t2
     0 : t1 = t2
     1 : t1 > t2
    
    Arguments:
        t1 {string} -- String in format HH:MM
        t2 {string} -- String in format HH:MM
    
    Returns:
        int -- Integer showing inequality or equality
    """
    

    # Split the hour and the minute
    h1, m1 = t1.split(':')
    h2, m2 = t2.split(':')

    # Determine the total number of minutes
    # To make performing calculations easy
    t1 = int(h1) * 60 + int(m1)
    t2 = int(h2) * 60 + int(m2)

    if t1 < t2:
        return -1
    elif t1 > t2:
        return 1
    else:
        return 0


def diffBetweenTimes(t1, t2):
    """Returns the difference between times
    > t1 - t2
    
    Arguments:
        t1 {string} -- String in format HH:MM
        t2 {string} -- String in format HH:MM
    
    Returns:
        int -- Difference between times (in minutes)
    """

    # Split the hour and the minute
    h1, m1 = t1.split(':')
    h2, m2 = t2.split(':')

    # Determine the total number of minutes
    # To make performing calculations easy
    t1 = int(h1) * 60 + int(m1)
    t2 = int(h2) * 60 + int(m2)

    return t1 - t2


# if __name__ == "__main__":

#     mergedBounds = mergeBounds(bounds1, bounds2)
#     print('Merged Bounds: ', mergedBounds)

#     mergedSch = mergeSchedules(mergedBounds, schedule1, schedule2)
#     print('Merged Sch: ', mergedSch)

#     freeTimes = getFreeTimes(mergedSch, duration, mergedBounds)
#     print('Free Slots: ', freeTimes)