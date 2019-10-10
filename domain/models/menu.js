class Menu {
    constructor(menuSections) {
        if (menuSections) {
            if (!Array.isArray(menuSections) || (menuSections.length > 0 && !(menuSections[0] instanceof MenuSection)))
                throw new Error('menuSections must be an array of MenuSection instances');
            this.menuSections = menuSections;
        } else
            this.menuSections = [];
        this.menuSections.sort((a, b) => a.compareTo(b));
    }

    setMenuSections(menuSections) {
        if (!menuSections)
            throw new Error('Missing the following param: menuSections');
        if (!Array.isArray(menuSections) || (menuSections.length > 0 && !(menuSections[0] instanceof MenuSection)))
            throw new Error('menuSections must be an array of MenuSection instances');
        this.menuSections = menuSections;
        this._sortMenuSections();
    }

    addMenuSection(menuSection) {
        if (!menuSection)
            throw new Error('Missing the following param: menuSection');
        if (!(menuSection instanceof MenuSection))
            throw new Error('menuSection param must be an instace of MenuSection');
        this.menuSections.push(menuSection);
    }

    _sortMenuSections() {
        this.menuSections.sort((a, b) => a.compareTo(b));
    }
}

class MenuSection {
    constructor(sectionIndex, name, dishes) {
        if (!sectionIndex || !name)
            throw new Error(`Missing the following constructor params:${sectionIndex ? '' : ' sectionIndex'}${name ? '' : ' name'}`);
        if (dishes) {
            if (!Array.isArray(dishes) || (dishes.length > 0 && !(dishes[0] instanceof Dish)))
                throw new Error('dishes must be an array of Dish instances');
            this.dishes = dishes;
        } else
            this.dishes = [];
        this.sectionIndex = sectionIndex;
        this.name = name;
    }

    compareTo(obj) {
        if (!(obj instanceof MenuSection))
            throw new Error('obj is not a MenuSection instance and it\'s not comparable');
        return this.sectionIndex <= obj.sectionIndex ? -1 : 1;
    }

    setDishes(dishes) {
        if (!dishes)
            throw new Error('Missing the following param: dishes');
        if (!Array.isArray(dishes) || (dishes.length > 0 && !(dishes[0] instanceof Dish)))
            throw new Error('dishes must be an array of Dish instances');
        this.dishes = dishes;
    }

    addDish(dish) {
        if (!dish)
            throw new Error('Missing the following param: dish');
        if (!(dish instanceof Dish))
            throw new Error('dish param must be an instace of Dish');
        this.dishes.push(dish);
    }
}

class Dish {
    constructor(name, price, description, ingredients) {
        if (!name || !price)
            throw new Error(`Missing the following constructor params:${name ? '' : ' name'}${price ? '' : ' price'}`);
        if (ingredients && (!Array.isArray(ingredients) || (ingredients.length > 0 && typeof ingredients[0] !== 'string')))
            throw new Error('ingredients must be an array of string');
        if (description && typeof description !== 'string')
            throw new Error('description must be a string');
        this.name = name;
        this.price = price;
        this.description = description || '';
        this.ingredients = ingredients || [];
    }

    compareTo(obj) {
        if (!(obj instanceof Dish))
            throw new Error('obj is not a Dish instance and it\'s not comparable');
        return this.name <= obj.name ? -1 : 1;
    }
}

module.exports = {
    Menu,
    MenuSection,
    Dish,
};
