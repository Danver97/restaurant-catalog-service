const assert = require('assert');
const menuModule = require('../domain/models/menu');

const Menu = menuModule.Menu;
const MenuSection = menuModule.MenuSection;
const Dish = menuModule.Dish;
const Price = menuModule.Price;

describe('Menu module unit test', () => {

    context('Price class test', () => {

        it('check constructor works', () => {
            assert.throws(() => new Price());
            assert.throws(() => new Price('a'));
            assert.throws(() => new Price(15));
            assert.throws(() => new Price(15, 'eur'));
            const p = new Price(15, 'EUR');
            assert.strictEqual(p.value, 15);
            assert.strictEqual(p.currency, 'EUR');
        });

        it('check fromObject works', () => {
            assert.throws(() => Price.fromObject());
            const p = Price.fromObject({ value: 15, currency: 'EUR' });
            assert.strictEqual(p.value, 15);
            assert.strictEqual(p.currency, 'EUR');
        });

        it('check toString works', () => {
            const p = new Price(15.5, 'EUR');
            const space = String.fromCharCode(160)
            assert.strictEqual(p.toString('en-GB').replace(space, ' '), '€15.50');
            assert.strictEqual(p.toString('it-IT').replace(space, ' '), '€ 15.50');
            const p2 = new Price(15.5, 'GBP');
            assert.strictEqual(p2.toString('en-GB').replace(space, ' '), '£15.50');
            assert.strictEqual(p2.toString('it-IT').replace(space, ' '), '£ 15.50');
        });
    });

    context('Dish class test', () => {
        const name = 'AA';
        const price = new Price(7.89, 'EUR');
        const ingredients = ['banana', 'strawberry'];
        const description = 'A mix of fruits';

        it('check constructor works', () => {
            assert.throws(() => new Dish(), Error);
            assert.throws(() => new Dish(name), Error);
            assert.throws(() => new Dish(name, price, 123), Error);
            assert.throws(() => new Dish(name, price, description, [1, 2]), Error);
            assert.throws(() => new Dish(name, price, description, [1, 2]), Error);
            assert.throws(() => new Dish(name, price, description, ['adfgd'], 1), Error);
            let d = new Dish(name, price, description, ingredients);
            assert.strictEqual(d.name, name);
            assert.strictEqual(d.price, price);
            assert.strictEqual(d.description, description);
            assert.strictEqual(d.ingredients, ingredients);
            d = new Dish(name, price);
            assert.strictEqual(d.description, '');
            assert.deepStrictEqual(d.ingredients, []);
        });

        it('check compareTo works', () => {
            const d1 = new Dish(name, price, description, ingredients);
            const d2 = new Dish(name, price, description, ingredients);
            const d3 = new Dish('BB', price, description, ingredients);
            assert.strictEqual(d1.compareTo(d2), -1);
            assert.strictEqual(d1.compareTo(d3), -1);
            assert.strictEqual(d3.compareTo(d1), 1);
        });
    });
    
    context('MenuSection class test', () => {
        const d1 = new Dish('Fruit Mix', new Price(7.99, 'EUR'), 'A fruit mix', ['banana', 'strawberry']);
        const d2 = new Dish('Another Fruit Mix', new Price(9.99, 'EUR'), 'Another fruit mix', ['banana', 'passion fruit']);
        const d3 = new Dish('Fruit Mix 3', new Price(9.99, 'EUR'), 'Another fruit mix', ['banana', 'passion fruit']);

        it('check constructor works', () => {
            assert.throws(() => new MenuSection(), Error);
            assert.throws(() => new MenuSection('1', 'section'), Error);
            assert.throws(() => new MenuSection(1, 1), Error);
            const index = 1;
            const name = 'Antipasti'
            let section = new MenuSection(index, name);
            assert.strictEqual(section.sortIndex, index);
            assert.strictEqual(section.name, name);
            assert.deepStrictEqual(section.dishes, []);
            section = new MenuSection(index, name, [d1]);
            assert.deepStrictEqual(section.dishes, [d1]);
        });

        it('check addDish works', () => {
            const index = 1;
            const name = 'Antipasti'
            const section = new MenuSection(index, name);
            assert.throws(() => section.addDish(), Error);
            assert.throws(() => section.addDish({}), Error);
            section.addDish(d1);
            assert.deepStrictEqual(section.dishes, [d1]);
            assert.throws(() => section.addDish(d1), Error);
            section.addDish(d2);
            assert.deepStrictEqual(section.dishes, [d1, d2]);

        });

        it('check setDishes works', () => {
            const index = 1;
            const name = 'Antipasti'
            const section = new MenuSection(index, name);
            assert.throws(() => section.setDishes(), Error);
            assert.throws(() => section.setDishes({}), Error);
            assert.throws(() => section.setDishes([{}]), Error);
            assert.throws(() => section.setDishes([d1, d1]), Error);
            section.setDishes([d1, d2]);
            assert.deepStrictEqual(section.dishes, [d1, d2]);
            section.setDishes([d2, d3]);
            assert.deepStrictEqual(section.dishes, [d2, d3]);
        });

        it('check compareTo works', () => {
            const name = 'Antipasti'
            const section1 = new MenuSection(1, name);
            const section2 = new MenuSection(2, name);
            assert.strictEqual(section1.compareTo(section2), -1);
            assert.strictEqual(section2.compareTo(section1), 1);
        });
    });

    context('Menu class test', () => {
        const d1 = new Dish('Fruit Mix', new Price(7.99, 'EUR'), 'A fruit mix', ['banana', 'strawberry']);
        const d2 = new Dish('Another Fruit Mix', new Price(9.99, 'EUR'), 'Another fruit mix', ['banana', 'passion fruit']);
        const d3 = new Dish('Fruit Mix 3', new Price(9.99, 'EUR'), 'Another fruit mix', ['banana', 'passion fruit']);
        const section1 = new MenuSection(1, 'Antipasti', [d1, d3]);
        const section2 = new MenuSection(2, 'Primi', [d2]);
        const section3 = new MenuSection(2, 'Antipasti');

        it('check constructor works', () => {
            assert.throws(() => new Menu(1), Error);
            assert.throws(() => new Menu([{}]), Error);
            assert.throws(() => new Menu([section1, section3]), Error);
            let m = new Menu();
            assert.deepStrictEqual(m.menuSections, []);
            m = new Menu([section1]);
            assert.deepStrictEqual(m.menuSections, [section1]);
            m = new Menu([section1, section2]);
            assert.deepStrictEqual(m.menuSections, [section1, section2]);
        });

        it('check addMenuSection works', () => {
            const menu = new Menu();
            assert.throws(() => menu.addMenuSection(), Error);
            assert.throws(() => menu.addMenuSection({}), Error);
            menu.addMenuSection(section1);
            assert.deepStrictEqual(menu.menuSections, [section1]);
            assert.throws(() => menu.addMenuSection(section3), Error);
            menu.addMenuSection(section2);
            assert.deepStrictEqual(menu.menuSections, [section1, section2]);
        });

        it('check setMenuSections works', () => {
            const menu = new Menu();
            assert.throws(() => menu.setMenuSections(), Error);
            assert.throws(() => menu.setMenuSections({}), Error);
            assert.throws(() => menu.setMenuSections([{}]), Error);
            menu.setMenuSections([section1]);
            assert.deepStrictEqual(menu.menuSections, [section1]);
            assert.throws(() => menu.setMenuSections([section1, section3]), Error);
            menu.setMenuSections([section2, section1]);
            assert.deepStrictEqual(menu.menuSections, [section1, section2]);
        });
    });
});
