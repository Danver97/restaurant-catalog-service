class Menu {
    constructor(menuSections) {
        if (menuSections) {
            this._checkMenuSectionArray(menuSections);
            this.menuSections = menuSections;
        } else
            this.menuSections = [];
        this.menuSections.sort((a, b) => a.compareTo(b));
        this.sectionNameSet = this._computeSectionNameSet(this.menuSections);
    }

    static fromObject(obj) {
        if (!obj)
            throw new Error('Missing obj parameter');
        const sections = obj.map(s => MenuSection.fromObject(s));
        return new Menu(sections);
    }

    _computeSectionNameSet(menuSections) {
        const sectionNameSet = new Set();
        menuSections.forEach(s => {
            if (sectionNameSet.has(s.name))
                throw new Error(`Section with name ${s.name} already present in the menu`);
            sectionNameSet.add(s.name);
        });
        return sectionNameSet;
    }

    _checkMenuSectionArray(menuSections) {
        if (!Array.isArray(menuSections) || (menuSections.length > 0 && !(menuSections[0] instanceof MenuSection)))
            throw new Error('menuSections must be an array of MenuSection instances');
    }

    setMenuSections(menuSections) {
        if (!menuSections)
            throw new Error('Missing the following param: menuSections');
        this._checkMenuSectionArray(menuSections);
        
        const sectionNameSet = this._computeSectionNameSet(menuSections);

        this.menuSections = menuSections;
        this.sectionNameSet = sectionNameSet;
        this._sortMenuSections();
    }

    addMenuSection(menuSection) {
        if (!menuSection)
            throw new Error('Missing the following param: menuSection');
        if (!(menuSection instanceof MenuSection))
            throw new Error('menuSection param must be an instace of MenuSection');
        if (this.sectionNameSet.has(menuSection.name))
            throw new Error(`Section with name ${menuSection.name} already present in the menu`);
        this.sectionNameSet.add(menuSection.name);
        this.menuSections.push(menuSection);
        this._sortMenuSections();
    }

    _sortMenuSections() {
        this.menuSections.sort((a, b) => a.compareTo(b));
    }

    toJSON() {
        return this.menuSections;
    }
}

class MenuSection {
    constructor(sortIndex, name, dishes) {
        if (!sortIndex || !name)
            throw new Error(`Missing the following constructor params:${sortIndex ? '' : ' sectionIndex'}${name ? '' : ' name'}`);
        if (typeof sortIndex !== 'number')
            throw new Error('sectionIndex must be a number');
        if (typeof name !== 'string')
            throw new Error('name must be a string');
        if (dishes) {
            this._checkDishArray(dishes);
            this.dishes = dishes;
        } else
            this.dishes = [];
        this.sortIndex = sortIndex;
        this.name = name;

        this.dishNameSet = this._computeDishNameSet(this.dishes);
    }

    static fromObject(obj) {
        if (!obj)
            throw new Error('Missing obj parameter');
        obj.dishes = obj.dishes.map(d => Dish.fromObject(d));
        return new MenuSection(obj.sortIndex, obj.name, obj.dishes);
    }

    _computeDishNameSet(dishes) {
        const dishNameSet = new Set();
        dishes.forEach(d => {
            if (dishNameSet.has(d.name))
                throw new Error(`Dish with name ${d.name} already present in the section`);
            dishNameSet.add(d.name);
        });
        return dishNameSet;
    }

    _checkDishArray(dishes) {
        if (!Array.isArray(dishes) || (dishes.length > 0 && !(dishes[0] instanceof Dish)))
            throw new Error('dishes must be an array of Dish instances');
    }

    compareTo(obj) {
        if (!(obj instanceof MenuSection))
            throw new Error('obj is not a MenuSection instance and it\'s not comparable');
        return this.sortIndex <= obj.sortIndex ? -1 : 1;
    }

    setDishes(dishes) {
        if (!dishes)
            throw new Error('Missing the following param: dishes');
        this._checkDishArray(dishes);

        const dishNameSet = this._computeDishNameSet(dishes);
        this.dishes = dishes;
        this.dishNameSet = dishNameSet;
    }

    addDish(dish) {
        if (!dish)
            throw new Error('Missing the following param: dish');
        if (!(dish instanceof Dish))
            throw new Error('dish param must be an instace of Dish');
        if (this.dishNameSet.has(dish.name))
            throw new Error(`Dish with name ${d.name} already present in the section`);
        this.dishes.push(dish);
        this.dishNameSet.add(dish.name);
    }

    removeDish(dish) {
        if (!dish)
            throw new Error('Missing the following param: dish');
        if (!(dish instanceof Dish))
            throw new Error('dish param must be an instace of Dish');
        if (!this.dishNameSet.has(dish.name))
            throw new Error(`Dish with name ${d.name} is not present in the section`);
        this.dishes.delete(dish);
        this.dishNameSet.delete(dish.name);
    }

    toJSON() {
        return {
            dishes: this.dishes,
            sortIndex: this.sortIndex,
            name: this.name,
        };
    }
}

class Dish {
    constructor(name, price, description, ingredients, image) {
        if (!name || !price)
            throw new Error(`Missing the following constructor params:${name ? '' : ' name'}${price ? '' : ' price'}`);
        if (!(price instanceof Price))
            throw new Error('price param must be instance of Price');
        if (description && typeof description !== 'string')
            throw new Error('description must be a string');
        if (ingredients && (!Array.isArray(ingredients) || (ingredients.length > 0 && typeof ingredients[0] !== 'string')))
            throw new Error('ingredients must be an array of string');
        if (image && typeof image !== 'string')
            throw new Error('description must be a string');
        this.name = name;
        this.price = price;
        this.description = description || '';
        this.ingredients = ingredients || [];
        this.image = image;
    }

    static fromObject(obj) {
        if (!obj)
            throw new Error('Missing obj parameter');
        const price = Price.fromObject(obj.price);
        return new Dish(obj.name, price, obj.description, obj.ingredients, obj.image);
    }

    compareTo(obj) {
        if (!(obj instanceof Dish))
            throw new Error('obj is not a Dish instance and it\'s not comparable');
        return this.name <= obj.name ? -1 : 1;
    }
}

class Price {
    constructor(value, currency) {
        if (!value || !currency)
            throw new Error(`Missing the following constructor params:${value ? '' : ' value'}${currency ? '' : ' currency'}`);
        if (typeof value !== 'number')
            throw new Error('value param must be a number');
        if (typeof currency !== 'string')
            throw new Error('currency param must be a string');
        if (!/[A-Z]{3}/.test(currency))
            throw new Error('currency param must be a valid ISO 4217 currency code');
        this.value = value;
        this.currency = currency;
    }
    
    static fromObject(obj) {
        if (!obj)
            throw new Error('Missing obj parameter');
        return new Price(obj.value, obj.currency);
    }

    toString(locale) {
        return new Intl.NumberFormat(locale, { style: 'currency', currency: this.currency }).format(this.value);
    }
}

module.exports = {
    Menu,
    MenuSection,
    Dish,
    Price,
};
