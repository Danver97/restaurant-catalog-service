const dependencies = {
    store: null,
};

function handler1() {
    
}

function handler2() {
    
}

function handler3() {
    
}

function eventHandlers(store) {
    if (!dependencies.store)
        dependencies.store = store;
    return {
        handler1,
        handler2,
        handler3,
    };
}

module.exports = eventHandlers;
