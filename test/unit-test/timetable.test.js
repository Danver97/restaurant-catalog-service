const assert = require('assert');
const timetableModule = require('../../domain/models/timetable');

const Timetable = timetableModule.Timetable;
const DayTimetable = timetableModule.DayTimetable;
const OpeningInteval = timetableModule.OpeningInteval;
const OpeningHour = timetableModule.OpeningHour;
const DayOfWeek = timetableModule.DayOfWeek;

describe('Timetable module unit test', function () {

    context('OpeningHour class test', () => {
        it('check if constructor works', () => {
            assert.throws(() => new OpeningHour(), Error);
            const h = 15;
            const m = 0;
            const oh = new OpeningHour(h,m);
            assert.strictEqual(oh.h, h);
            assert.strictEqual(oh.m, m);
        });

        it('check setHour works', () => {
            const h = 15;
            const m = 0;
            const oh = new OpeningHour(h,m);
            assert.throws(() => oh.setHours(), Error);
            assert.throws(() => oh.setHours(''), Error);
            oh.setHours(16);
            assert.strictEqual(oh.h, 16);
            oh.setHours(24);
            assert.strictEqual(oh.h, 0);
            oh.setHours(30);
            assert.strictEqual(oh.h, 6);
        });

        it('check setHour works', () => {
            const h = 15;
            const m = 0;
            const oh = new OpeningHour(h,m);
            assert.throws(() => oh.setMinutes(), Error);
            assert.throws(() => oh.setMinutes(''), Error);
            oh.setMinutes(16);
            assert.strictEqual(oh.m, 16);
            oh.setMinutes(75);
            assert.strictEqual(oh.m, 15);
            assert.strictEqual(oh.h, h+1);
        });

        it('check before works', () => {
            const oh1 = new OpeningHour(15,0);
            const oh2 = new OpeningHour(16,0);
            const oh3 = new OpeningHour(15,15);
            assert.throws(() => oh1.before(), Error);
            assert.throws(() => oh1.before({}), Error);
            assert.ok(oh1.before(oh2));
            assert.ok(oh1.before(oh3));
            assert.ok(oh3.before(oh2));
            assert.ok(!oh3.before(oh1));
            assert.ok(!oh2.before(oh1));
        });
        it('check equals works', () => {
            const oh1 = new OpeningHour(15,0);
            const oh2 = new OpeningHour(15,0);
            const oh3 = new OpeningHour(15,15);
            assert.throws(() => oh1.equals(), Error);
            assert.throws(() => oh1.equals({}), Error);
            assert.ok(oh1.equals(oh2));
            assert.ok(!oh1.equals(oh3));
            assert.ok(!oh3.equals(oh1));
        });

        it('check after works', () => {
            const oh1 = new OpeningHour(15,0);
            const oh2 = new OpeningHour(16,0);
            const oh3 = new OpeningHour(15,15);
            const oh4 = new OpeningHour(15,15);
            assert.throws(() => oh1.after(), Error);
            assert.throws(() => oh1.after({}), Error);
            assert.ok(oh2.after(oh1));
            assert.ok(oh2.after(oh3));
            assert.ok(!oh3.after(oh2));
            assert.ok(oh3.after(oh1));
            assert.ok(!oh3.after(oh4));
        });

        it('check clone works', () => {
            const oh1 = new OpeningHour(15,0);
            assert.deepStrictEqual(oh1.clone(), oh1);
        });

        it('check compareTo works', () => {
            const oh1 = new OpeningHour(15,0);
            const oh2 = new OpeningHour(16,0);
            const oh3 = new OpeningHour(15,15);
            const oh4 = new OpeningHour(15,15);
            assert.throws(() => oh1.compareTo(), Error);
            assert.throws(() => oh1.compareTo({}), Error);
            assert.strictEqual(oh1.compareTo(oh2), -1);
            assert.strictEqual(oh1.compareTo(oh3), -1);
            assert.strictEqual(oh2.compareTo(oh1), 1);
            assert.strictEqual(oh3.compareTo(oh4), 0);
        });
    });

    context('OpeningInterval class test', () => {
        it('check if constructor works', () => {
            const opening = new OpeningHour(15,0);
            const closing0 = new OpeningHour(15,0);
            const closing1 = new OpeningHour(14,0);
            const closing = new OpeningHour(20,15);
            assert.throws(() => new OpeningInteval(), Error);
            assert.throws(() => new OpeningInteval(opening), Error);
            assert.throws(() => new OpeningInteval(opening, closing0), Error);
            assert.throws(() => new OpeningInteval(opening, closing1), Error);
            const oInterval = new OpeningInteval(opening, closing);
            assert.strictEqual(oInterval.opening.h, 15);
            assert.strictEqual(oInterval.opening.m, 0);
            assert.strictEqual(oInterval.closing.h, 20);
            assert.strictEqual(oInterval.closing.m, 15);
        });
    });

    context('DayTimetable class test', () => {
        const opening1 = new OpeningHour(11,30);
        const closing1 = new OpeningHour(13,15);
        const opening2 = new OpeningHour(15,0);
        const closing2 = new OpeningHour(20,15);
        const interval1 = new OpeningInteval(opening1, closing1);
        const interval2 = new OpeningInteval(opening2, closing2);

        it('check constructor works', () => {
            assert.throws(() => new DayTimetable(), Error);
            assert.throws(() => new DayTimetable(DayOfWeek.MONDAY, {}), Error);
            assert.throws(() => new DayTimetable(DayOfWeek.MONDAY, [1]), Error);
            let dayTimetable = new DayTimetable(DayOfWeek.MONDAY);
            assert.deepStrictEqual(dayTimetable.dayOfWeek, DayOfWeek.MONDAY);
            assert.deepStrictEqual(dayTimetable.openings, []);
            dayTimetable = new DayTimetable(DayOfWeek.MONDAY, [interval1]);
            assert.deepStrictEqual(dayTimetable.openings, [interval1]);
        });

        it('check addOpening works', () => {
            let dayTimetable = new DayTimetable(DayOfWeek.MONDAY);
            assert.throws(() => dayTimetable.addOpening(), Error);
            assert.throws(() => dayTimetable.addOpening({}), Error);
            dayTimetable.addOpening(interval1);
            assert.deepStrictEqual(dayTimetable.openings, [interval1]);
            dayTimetable.addOpening(interval2);
            assert.deepStrictEqual(dayTimetable.openings, [interval1, interval2]);
            
            dayTimetable = new DayTimetable(DayOfWeek.MONDAY, [interval1]);
            dayTimetable.addOpening(interval2);
            assert.deepStrictEqual(dayTimetable.openings, [interval1, interval2]);
        });

        it('check setOpenings works', () => {
            let dayTimetable = new DayTimetable(DayOfWeek.MONDAY);
            assert.throws(() => dayTimetable.setOpenings(), Error);
            assert.throws(() => dayTimetable.setOpenings({}), Error);
            assert.throws(() => dayTimetable.setOpenings([1,2]), Error);

            dayTimetable.setOpenings([interval1]);
            assert.deepStrictEqual(dayTimetable.openings, [interval1]);
            dayTimetable.setOpenings([interval1, interval2]);
            assert.deepStrictEqual(dayTimetable.openings, [interval1, interval2]);
            
            dayTimetable = new DayTimetable(DayOfWeek.MONDAY, [interval1]);
            dayTimetable.setOpenings([interval1, interval2]);
            assert.deepStrictEqual(dayTimetable.openings, [interval1, interval2]);
        });
    });

    context('Timetable class test', () => {
        const opening1 = new OpeningHour(11,30);
        const closing1 = new OpeningHour(13,15);
        const opening2 = new OpeningHour(15,0);
        const closing2 = new OpeningHour(20,15);
        const interval1 = new OpeningInteval(opening1, closing1);
        const interval2 = new OpeningInteval(opening2, closing2);
        const monday = new DayTimetable(DayOfWeek.MONDAY, [interval1, interval2]);
        const tuesday = new DayTimetable(DayOfWeek.TUESDAY, [interval1, interval2]);
        const wednesday = new DayTimetable(DayOfWeek.WEDNESDAY, [interval1, interval2]);
        const thursday = new DayTimetable(DayOfWeek.THURSDAY, [interval1, interval2]);
        const friday = new DayTimetable(DayOfWeek.FRIDAY, [interval1, interval2]);
        const saturday = new DayTimetable(DayOfWeek.SATURDAY, [interval1, interval2]);
        const sunday = new DayTimetable(DayOfWeek.SUNDAY, [interval1, interval2]);

        it('check if constructor works', () => {
            const timetable = new Timetable();
            assert.deepStrictEqual(timetable.days, {});
        });

        it('check if setDay works', () => {
            const timetable = new Timetable();
            assert.throws(() => timetable.setDay(), Error);
            assert.throws(() => timetable.setDay({}), Error);
            timetable.setDay(monday);
            assert.deepStrictEqual(timetable.days, { 1: monday });
        });

        it('check if getDay works', () => {
            const timetable = new Timetable();
            timetable.days = { 1: monday };
            assert.deepStrictEqual(timetable.getDay(1), monday);
        });

        it('check if setDays works', () => {
            const timetable = new Timetable();
            assert.throws(() => timetable.setDays(), Error);
            assert.throws(() => timetable.setDays({}), Error);
            assert.throws(() => timetable.setDays({ 1: {} }), Error);
            assert.throws(() => timetable.setDays({ 1: tuesday }), Error);
            const newDays = {
                1: monday,
                2: tuesday,
                3: wednesday,
                4: thursday,
                5: friday,
                6: saturday,
                7: sunday,
            };
            timetable.setDays(newDays);
            assert.deepStrictEqual(timetable.days, newDays);
        });
    });
});
