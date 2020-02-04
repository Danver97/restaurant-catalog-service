const uuid = require('uuid/v4');
const Table = require('../../../domain/models/table');
const menuLib = require('../../../domain/models/menu');
const timetableLib = require('../../../domain/models/timetable');
const Location = require('../../../domain/models/location');
const Phone = require('../../../domain/models/phone');
const Restaurant = require('../../../domain/models/restaurant');

// Table

const defaultTables1 = [new Table('1', 4), new Table('2', 5)];
const defaultTables2 = [new Table('1', 4), new Table('2', 5), new Table('3', 6)];
const defaultTables3 = [new Table('1', 4)];

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

const defaultMenuSections2 = [
    new MenuSection(2, 'Primi', [
        new Dish('Pasta cacio pepe', new Price(7.99, 'EUR'), 'bla bla', ['Pasta', 'Cacio', 'Pepe']),
        new Dish('Amatriciana', new Price(8.99, 'EUR'), 'bla bla', ['Pasta', 'Guanciale', 'Eggs']),
    ]),
]
const defaultMenu2 = new Menu(defaultMenuSections2);

const defaultMenuSections3 = [
    new MenuSection(1, 'Antipasti', [
        new Dish('Bruschetta', new Price(3.99, 'EUR'), 'bla bla', ['Bread', 'Tomato']),
    ]),
    new MenuSection(2, 'Primi', [
        new Dish('Pasta cacio pepe', new Price(7.99, 'EUR'), 'bla bla', ['Pasta', 'Cacio', 'Pepe']),
        new Dish('Amatriciana', new Price(8.99, 'EUR'), 'bla bla', ['Pasta', 'Guanciale', 'Eggs']),
    ]),
]
const defaultMenu3 = new Menu(defaultMenuSections3);


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
const days2 = {
    [DayOfWeek.MONDAY.toInt()]: new DayTimetable(DayOfWeek.MONDAY, [
        new OpeningInteval(new OpeningHour(12, 30), new OpeningHour(14, 30)),
        new OpeningInteval(new OpeningHour(19, 30), new OpeningHour(23, 30)),
    ]),
    [DayOfWeek.TUESDAY.toInt()]: new DayTimetable(DayOfWeek.TUESDAY, [
        new OpeningInteval(new OpeningHour(12, 30), new OpeningHour(14, 30)),
        new OpeningInteval(new OpeningHour(19, 30), new OpeningHour(23, 30)),
    ]),
    [DayOfWeek.WEDNESDAY.toInt()]: new DayTimetable(DayOfWeek.WEDNESDAY, [
        new OpeningInteval(new OpeningHour(12, 30), new OpeningHour(14, 30)),
        new OpeningInteval(new OpeningHour(19, 30), new OpeningHour(23, 30)),
    ]),
    [DayOfWeek.THURSDAY.toInt()]: new DayTimetable(DayOfWeek.THURSDAY, [
        new OpeningInteval(new OpeningHour(12, 30), new OpeningHour(14, 30)),
        new OpeningInteval(new OpeningHour(19, 30), new OpeningHour(23, 30)),
    ]),
    [DayOfWeek.FRIDAY.toInt()]: new DayTimetable(DayOfWeek.FRIDAY, [
        new OpeningInteval(new OpeningHour(12, 30), new OpeningHour(14, 30)),
        new OpeningInteval(new OpeningHour(19, 30), new OpeningHour(23, 30)),
    ]),
    [DayOfWeek.SATURDAY.toInt()]: new DayTimetable(DayOfWeek.SATURDAY, [
        new OpeningInteval(new OpeningHour(12, 30), new OpeningHour(14, 30)),
        new OpeningInteval(new OpeningHour(19, 30), new OpeningHour(23, 30)),
    ]),
    [DayOfWeek.SUNDAY.toInt()]: new DayTimetable(DayOfWeek.SUNDAY, [
        new OpeningInteval(new OpeningHour(12, 30), new OpeningHour(14, 30)),
        new OpeningInteval(new OpeningHour(19, 30), new OpeningHour(23, 30)),
    ]),
}
const defaultTimetable = new Timetable();
defaultTimetable.setDays(days);
const defaultTimetable2 = new Timetable();
defaultTimetable2.setDays(days2);

// Location
const coords = {
    lat: 44.5514468,
    lon: 7.7231257,
};
const address = 'via Roma 15, Fossano, Italia';
const defaultLocation = new Location(coords, address);

// Phone
const defaultPhone = new Phone('+390172694784');

// Restaurant

function restaurant(restId, name) {
    return new Restaurant(restId || uuid(), name || 'Default Restaurant', uuid(), defaultTimetable, defaultMenu, defaultPhone);
}

module.exports = {
    defaultTables1,
    defaultTables2,
    defaultTables3,
    defaultMenu,
    defaultMenu2,
    defaultMenu3,
    defaultTimetable,
    defaultTimetable2,
    defaultLocation,
    defaultPhone,
    restaurant
};
