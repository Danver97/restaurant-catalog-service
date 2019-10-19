class Timetable {
    constructor() {
        this.days = {};
    }

    static fromObject(obj) {
        if (!obj)
            throw new Error('Missing obj parameter');
        Object.keys(obj).forEach(k => {
            obj[k] = DayTimetable.fromObject(obj[k]);
        });
        const timetable = new Timetable();
        timetable.setDays(obj);
        return timetable;
    }

    setDays(days) {
        if (!days)
            throw new Error(`Missing the following params: days`);
        const newDays = {};
        for (let i = 1; i <= 7; i++) {
            if (!days[i])
                throw new Error(`Day ${i} not found`);
            if (!(days[i] instanceof DayTimetable))
                throw new Error(`Day ${i} is not instance of DayTimetable`);
            if (days[i].dayOfWeek.toInt() !== i)
                throw new Error(`Day ${i} has corresponding index of ${days[i].dayOfWeek.toInt()}`);
            newDays[i] = days[i];
        }
        this.days = newDays;
    }

    setDay(day) {
        if (!(day instanceof DayTimetable))
            throw new Error(`day param must be instace of DayTimetable`);
        this.days[day.dayOfWeek.toInt()] = day;
    }

    getDay(dayIndex) {
        if (typeof dayIndex !== 'number')
            throw new Error(`dayIndex must be a number`);
        return this.days[dayIndex];
    }

    toJSON() {
        return this.days;
    }
}

class DayOfWeek {
    constructor(dayIndex) {
        if (typeof dayIndex !== 'number')
            throw new Error('dayIndex param must be a number');
        let day = Math.abs(dayIndex) || 1;
        this.dayIndex = day > 7 ? Math.floor(day / 7) : day;
    }
    toInt() {
        return this.dayIndex;
    }
    static get MONDAY() {
        return new DayOfWeek(1);
    }
    static get TUESDAY() {
        return new DayOfWeek(2);
    }
    static get WEDNESDAY() {
        return new DayOfWeek(3);
    }
    static get THURSDAY() {
        return new DayOfWeek(4);
    }
    static get FRIDAY() {
        return new DayOfWeek(5);
    }
    static get SATURDAY() {
        return new DayOfWeek(6);
    }
    static get SUNDAY() {
        return new DayOfWeek(7);
    }
    
    toJSON() {
        return this.dayIndex;
    }
}

class DayTimetable {
    constructor(dayOfWeek, openings) {
        if (!dayOfWeek)
            throw new Error(`Missing the following paramters:${dayOfWeek ? '' : ' dayOfWeek'}`);
        if (!(dayOfWeek instanceof DayOfWeek))
            throw new Error('dayOfWeek must be an instance of DayOfWeek')
        if (openings) {
            if (!Array.isArray(openings) || (openings.length > 0 && !(openings[0] instanceof OpeningInteval)))
                throw new Error('opening must be an array of Opening instances');
            this.openings = openings
        } else
            this.openings = [];
        this.dayOfWeek = dayOfWeek;
    }

    static fromObject(obj) {
        if (!obj)
            throw new Error('Missing obj parameter');
        const dayOfWeek = new DayOfWeek(obj.dayOfWeek);
        const openings = obj.openings.map(o => OpeningInteval.fromObject(o));
        return new DayTimetable(dayOfWeek, openings);
    }

    setOpenings(openings) {
        if (!openings)
            throw new Error('Missing the following paramters: openings');
        if (!Array.isArray(openings) || (openings.length > 0 && !(openings[0] instanceof OpeningInteval)))
            throw new Error('opening must be an array of Opening instances');
        this.openings = openings
    }

    addOpening(opening) {
        if (!opening)
            throw new Error(`Missing the following paramters: opening`);
        if (!(opening instanceof OpeningInteval))
            throw new Error(`opening param must be instace of Opening`);
        this.openings.push(opening);
    }
}

class OpeningInteval {
    constructor(opening, closing) {
        if (!opening || !closing)
            throw new Error(`Missing the following constructor parameters:${opening ? '' : ' opening'}${closing ? '' : ' closing'}`);
        if (!(opening instanceof OpeningHour))
            throw new Error(`opening param must be instance of OpeningHour`);
        if (!(closing instanceof OpeningHour))
            throw new Error(`closing param must be instance of OpeningHour`);
        if (!opening.before(closing))
            throw new Error(`opening time must be before closing`);
        this.opening = opening;
        this.closing = closing;
    }
    
    static fromObject(obj) {
        if (!obj)
            throw new Error('Missing obj parameter');
        const opening = OpeningHour.fromObject(obj.opening);
        const closing = OpeningHour.fromObject(obj.closing);
        return new OpeningInteval(opening, closing);
    }
}

class OpeningHour {
    constructor(h, m) {
        if ((!h && h !== 0) || (!m && m !== 0))
            throw new Error(`Missing the following constructor parameters:${h ? '' : ' h'}${m ? '' : ' m'}`);
        this.h = h;
        this.m = m;
    }

    static fromObject(obj) {
        if (!obj)
            throw new Error('Missing obj parameter');
        return new OpeningHour(obj.h, obj.m);
    }

    setHours(newH) {
        if (!newH)
            throw new Error('Missing the following paramters: newH');
        if (typeof newH !== 'number')
            throw new Error('newH param must be a number');
        this.h = newH % 24;
    }

    setMinutes(newM) {
        if (!newM)
            throw new Error('Missing the following paramters: newM');
        if (typeof newM !== 'number')
            throw new Error('newM param must be a number');
        const newH = Math.floor(newM / 60);
        this.setHours(this.h + newH);
        this.m = newM % 60;
    }

    before(obj) {
        if (!(obj instanceof OpeningHour))
            throw new Error('obj is not a OpeningHour instance');
        if (this.h !== obj.h)
            return this.h < obj.h;
        return this.m < obj.m;
    }

    equals(obj) {
        if (!(obj instanceof OpeningHour))
            throw new Error('obj is not a OpeningHour instance');
        return this.h === obj.h && this.m === obj.m;
    }
    
    after(obj) {
        if (!(obj instanceof OpeningHour))
            throw new Error('obj is not a OpeningHour instance');
        if (this.h !== obj.h)
            return this.h > obj.h;
        return this.m > obj.m;
    }

    clone() {
        return new OpeningHour(this.h, this.m);
    }

    compareTo(obj) {
        if (!(obj instanceof OpeningHour))
            throw new Error('obj is not a OpeningHour instance and it\'s not comparable');
        if (this.h !== obj.h)
            return this.h < obj.h ? -1 : 1;
        if (this.m === obj.m)
            return 0;
        return this.m < obj.m ? -1 : 1;
    }
}

module.exports = {
    Timetable,
    DayTimetable,
    OpeningInteval,
    OpeningHour,
    DayOfWeek,
};
