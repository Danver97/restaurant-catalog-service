const menuLib = require('../../../domain/models/menu');
const timetableLib = require('../../../domain/models/timetable');
const Phone = require('../../../domain/models/phone');

// Menu
const Menu = menuLib.Menu;
const MenuSection = menuLib.MenuSection;
const Dish = menuLib.Dish;
const Price = menuLib.Price;

const defaultMenuSections = [
    new MenuSection(1, 'Antipasti', [
        new Dish('Bruschetta', new Price(3.99, 'EUR'), 'bla bla', ['Bread', 'Tomato']),
        new Dish('Crostino', new Price(1.99, 'EUR'), 'bla bla', ['Bread']),
    ]),
    new MenuSection(2, 'Primi', [
        new Dish('Pasta cacio pepe', new Price(7.99, 'EUR'), 'bla bla', ['Pasta', 'Cacio', 'Pepe']),
        new Dish('Amatriciana', new Price(8.99, 'EUR'), 'bla bla', ['Pasta', 'Guanciale', 'Eggs']),
    ]),
]
const defaultMenu = new Menu(defaultMenuSections);


// Timetable
const Timetable = timetableLib.Timetable;
const DayTimetable = timetableLib.DayTimetable;
const OpeningInteval = timetableLib.OpeningInteval;
const OpeningHour = timetableLib.OpeningHour;
const DayOfWeek = timetableLib.DayOfWeek;

const days = {
    [DayOfWeek.MONDAY.toInt()]: new DayTimetable(DayOfWeek.MONDAY, [
        new OpeningInteval(new OpeningHour(11, 30), new OpeningHour(14, 30)),
        new OpeningInteval(new OpeningHour(18, 30), new OpeningHour(23, 30)),
    ]),
    [DayOfWeek.TUESDAY.toInt()]: new DayTimetable(DayOfWeek.TUESDAY, [
        new OpeningInteval(new OpeningHour(11, 30), new OpeningHour(14, 30)),
        new OpeningInteval(new OpeningHour(18, 30), new OpeningHour(23, 30)),
    ]),
    [DayOfWeek.WEDNESDAY.toInt()]: new DayTimetable(DayOfWeek.WEDNESDAY, [
        new OpeningInteval(new OpeningHour(11, 30), new OpeningHour(14, 30)),
        new OpeningInteval(new OpeningHour(18, 30), new OpeningHour(23, 30)),
    ]),
    [DayOfWeek.THURSDAY.toInt()]: new DayTimetable(DayOfWeek.THURSDAY, [
        new OpeningInteval(new OpeningHour(11, 30), new OpeningHour(14, 30)),
        new OpeningInteval(new OpeningHour(18, 30), new OpeningHour(23, 30)),
    ]),
    [DayOfWeek.FRIDAY.toInt()]: new DayTimetable(DayOfWeek.FRIDAY, [
        new OpeningInteval(new OpeningHour(11, 30), new OpeningHour(14, 30)),
        new OpeningInteval(new OpeningHour(18, 30), new OpeningHour(23, 30)),
    ]),
    [DayOfWeek.SATURDAY.toInt()]: new DayTimetable(DayOfWeek.SATURDAY, [
        new OpeningInteval(new OpeningHour(11, 30), new OpeningHour(14, 30)),
        new OpeningInteval(new OpeningHour(18, 30), new OpeningHour(23, 30)),
    ]),
    [DayOfWeek.SUNDAY.toInt()]: new DayTimetable(DayOfWeek.SUNDAY, [
        new OpeningInteval(new OpeningHour(11, 30), new OpeningHour(14, 30)),
        new OpeningInteval(new OpeningHour(18, 30), new OpeningHour(23, 30)),
    ]),
}
const defaultTimetable = new Timetable();
defaultTimetable.setDays(days);

// Phone
const defaultPhone = new Phone('+390172694784');

module.exports = {
    defaultMenu,
    defaultTimetable,
    defaultPhone,
};
