// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.

// This is a specialised implementation of a System module loader.

"use strict";

// @ts-nocheck
/* eslint-disable */
let System, __instantiate;
(() => {
  const r = new Map();

  System = {
    register(id, d, f) {
      r.set(id, { d, f, exp: {} });
    },
  };
  async function dI(mid, src) {
    let id = mid.replace(/\.\w+$/i, "");
    if (id.includes("./")) {
      const [o, ...ia] = id.split("/").reverse(),
        [, ...sa] = src.split("/").reverse(),
        oa = [o];
      let s = 0,
        i;
      while ((i = ia.shift())) {
        if (i === "..") s++;
        else if (i === ".") break;
        else oa.push(i);
      }
      if (s < sa.length) oa.push(...sa.slice(s));
      id = oa.reverse().join("/");
    }
    return r.has(id) ? gExpA(id) : import(mid);
  }

  function gC(id, main) {
    return {
      id,
      import: (m) => dI(m, id),
      meta: { url: id, main },
    };
  }

  function gE(exp) {
    return (id, v) => {
      v = typeof id === "string" ? { [id]: v } : id;
      for (const [id, value] of Object.entries(v)) {
        Object.defineProperty(exp, id, {
          value,
          writable: true,
          enumerable: true,
        });
      }
    };
  }

  function rF(main) {
    for (const [id, m] of r.entries()) {
      const { f, exp } = m;
      const { execute: e, setters: s } = f(gE(exp), gC(id, id === main));
      delete m.f;
      m.e = e;
      m.s = s;
    }
  }

  async function gExpA(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](await gExpA(d[i]));
      const r = e();
      if (r) await r;
    }
    return m.exp;
  }

  function gExp(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](gExp(d[i]));
      e();
    }
    return m.exp;
  }
  __instantiate = (m, a) => {
    System = __instantiate = undefined;
    rF(m);
    return a ? gExpA(m) : gExp(m);
  };
})();

System.register("https://ecsy.io/build/ecsy.module", [], function (exports_1, context_1) {
    "use strict";
    var hasWindow, now, SystemManager, ObjectPool, EventDispatcher, Query, QueryManager, Component, SystemStateComponent, EntityPool, EntityManager, ENTITY_CREATED, ENTITY_REMOVED, COMPONENT_ADDED, COMPONENT_REMOVE, ComponentManager, Version, Entity, DEFAULT_OPTIONS, World, System, TagComponent, copyValue, cloneValue, copyArray, cloneArray, copyJSON, cloneJSON, copyCopyable, cloneClonable, Types;
    var __moduleName = context_1 && context_1.id;
    function getName(Component) {
        return Component.name;
    }
    function componentPropertyName(Component) {
        return getName(Component);
    }
    function queryKey(Components) {
        var names = [];
        for (var n = 0; n < Components.length; n++) {
            var T = Components[n];
            if (typeof T === "object") {
                var operator = T.operator === "not" ? "!" : T.operator;
                names.push(operator + getName(T.Component));
            }
            else {
                names.push(getName(T));
            }
        }
        return names.sort().join("-");
    }
    function Not(Component) {
        return {
            operator: "not",
            Component: Component
        };
    }
    exports_1("Not", Not);
    function createType(typeDefinition) {
        var mandatoryProperties = ["name", "default", "copy", "clone"];
        var undefinedProperties = mandatoryProperties.filter(p => {
            return !typeDefinition.hasOwnProperty(p);
        });
        if (undefinedProperties.length > 0) {
            throw new Error(`createType expects a type definition with the following properties: ${undefinedProperties.join(", ")}`);
        }
        typeDefinition.isType = true;
        return typeDefinition;
    }
    exports_1("createType", createType);
    function generateId(length) {
        var result = "";
        var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
    function injectScript(src, onLoad) {
        var script = document.createElement("script");
        script.src = src;
        script.onload = onLoad;
        (document.head || document.documentElement).appendChild(script);
    }
    function hookConsoleAndErrors(connection) {
        var wrapFunctions = ["error", "warning", "log"];
        wrapFunctions.forEach(key => {
            if (typeof console[key] === "function") {
                var fn = console[key].bind(console);
                console[key] = (...args) => {
                    connection.send({
                        method: "console",
                        type: key,
                        args: JSON.stringify(args)
                    });
                    return fn.apply(null, args);
                };
            }
        });
        window.addEventListener("error", error => {
            connection.send({
                method: "error",
                error: JSON.stringify({
                    message: error.error.message,
                    stack: error.error.stack
                })
            });
        });
    }
    function includeRemoteIdHTML(remoteId) {
        let infoDiv = document.createElement("div");
        infoDiv.style.cssText = `
    align-items: center;
    background-color: #333;
    color: #aaa;
    display:flex;
    font-family: Arial;
    font-size: 1.1em;
    height: 40px;
    justify-content: center;
    left: 0;
    opacity: 0.9;
    position: absolute;
    right: 0;
    text-align: center;
    top: 0;
  `;
        infoDiv.innerHTML = `Open ECSY devtools to connect to this page using the code:&nbsp;<b style="color: #fff">${remoteId}</b>&nbsp;<button onClick="generateNewCode()">Generate new code</button>`;
        document.body.appendChild(infoDiv);
        return infoDiv;
    }
    function enableRemoteDevtools(remoteId) {
        if (!hasWindow) {
            console.warn("Remote devtools not available outside the browser");
            return;
        }
        window.generateNewCode = () => {
            window.localStorage.clear();
            remoteId = generateId(6);
            window.localStorage.setItem("ecsyRemoteId", remoteId);
            window.location.reload(false);
        };
        remoteId = remoteId || window.localStorage.getItem("ecsyRemoteId");
        if (!remoteId) {
            remoteId = generateId(6);
            window.localStorage.setItem("ecsyRemoteId", remoteId);
        }
        let infoDiv = includeRemoteIdHTML(remoteId);
        window.__ECSY_REMOTE_DEVTOOLS_INJECTED = true;
        window.__ECSY_REMOTE_DEVTOOLS = {};
        let Version = "";
        let worldsBeforeLoading = [];
        let onWorldCreated = e => {
            var world = e.detail.world;
            Version = e.detail.version;
            worldsBeforeLoading.push(world);
        };
        window.addEventListener("ecsy-world-created", onWorldCreated);
        let onLoaded = () => {
            var peer = new Peer(remoteId);
            peer.on("open", () => {
                peer.on("connection", connection => {
                    window.__ECSY_REMOTE_DEVTOOLS.connection = connection;
                    connection.on("open", function () {
                        infoDiv.innerHTML = "Connected";
                        connection.on("data", function (data) {
                            if (data.type === "init") {
                                var script = document.createElement("script");
                                script.setAttribute("type", "text/javascript");
                                script.onload = () => {
                                    script.parentNode.removeChild(script);
                                    window.removeEventListener("ecsy-world-created", onWorldCreated);
                                    worldsBeforeLoading.forEach(world => {
                                        var event = new CustomEvent("ecsy-world-created", {
                                            detail: { world: world, version: Version }
                                        });
                                        window.dispatchEvent(event);
                                    });
                                };
                                script.innerHTML = data.script;
                                (document.head || document.documentElement).appendChild(script);
                                script.onload();
                                hookConsoleAndErrors(connection);
                            }
                            else if (data.type === "executeScript") {
                                let value = eval(data.script);
                                if (data.returnEval) {
                                    connection.send({
                                        method: "evalReturn",
                                        value: value
                                    });
                                }
                            }
                        });
                    });
                });
            });
        };
        injectScript("https://cdn.jsdelivr.net/npm/peerjs@0.3.20/dist/peer.min.js", onLoaded);
    }
    exports_1("enableRemoteDevtools", enableRemoteDevtools);
    return {
        setters: [],
        execute: function () {
            hasWindow = typeof window !== "undefined";
            now = hasWindow && typeof window.performance !== "undefined"
                ? performance.now.bind(performance)
                : Date.now.bind(Date);
            SystemManager = class SystemManager {
                constructor(world) {
                    this._systems = [];
                    this._executeSystems = [];
                    this.world = world;
                    this.lastExecutedSystem = null;
                }
                registerSystem(SystemClass, attributes) {
                    if (!SystemClass.isSystem) {
                        throw new Error(`System '${SystemClass.name}' does not extend 'System' class`);
                    }
                    if (this.getSystem(SystemClass) !== undefined) {
                        console.warn(`System '${SystemClass.name}' already registered.`);
                        return this;
                    }
                    var system = new SystemClass(this.world, attributes);
                    if (system.init)
                        system.init(attributes);
                    system.order = this._systems.length;
                    this._systems.push(system);
                    if (system.execute) {
                        this._executeSystems.push(system);
                        this.sortSystems();
                    }
                    return this;
                }
                unregisterSystem(SystemClass) {
                    let system = this.getSystem(SystemClass);
                    if (system === undefined) {
                        console.warn(`Can unregister system '${SystemClass.name}'. It doesn't exist.`);
                        return this;
                    }
                    this._systems.splice(this._systems.indexOf(system), 1);
                    if (system.execute) {
                        this._executeSystems.splice(this._executeSystems.indexOf(system), 1);
                    }
                    return this;
                }
                sortSystems() {
                    this._executeSystems.sort((a, b) => {
                        return a.priority - b.priority || a.order - b.order;
                    });
                }
                getSystem(SystemClass) {
                    return this._systems.find(s => s instanceof SystemClass);
                }
                getSystems() {
                    return this._systems;
                }
                removeSystem(SystemClass) {
                    var index = this._systems.indexOf(SystemClass);
                    if (!~index)
                        return;
                    this._systems.splice(index, 1);
                }
                executeSystem(system, delta, time) {
                    if (system.initialized) {
                        if (system.canExecute()) {
                            let startTime = now();
                            system.execute(delta, time);
                            system.executeTime = now() - startTime;
                            this.lastExecutedSystem = system;
                            system.clearEvents();
                        }
                    }
                }
                stop() {
                    this._executeSystems.forEach(system => system.stop());
                }
                execute(delta, time, forcePlay) {
                    this._executeSystems.forEach(system => (forcePlay || system.enabled) && this.executeSystem(system, delta, time));
                }
                stats() {
                    var stats = {
                        numSystems: this._systems.length,
                        systems: {}
                    };
                    for (var i = 0; i < this._systems.length; i++) {
                        var system = this._systems[i];
                        var systemStats = (stats.systems[system.constructor.name] = {
                            queries: {},
                            executeTime: system.executeTime
                        });
                        for (var name in system.ctx) {
                            systemStats.queries[name] = system.ctx[name].stats();
                        }
                    }
                    return stats;
                }
            };
            ObjectPool = class ObjectPool {
                constructor(T, initialSize) {
                    this.freeList = [];
                    this.count = 0;
                    this.T = T;
                    this.isObjectPool = true;
                    if (typeof initialSize !== "undefined") {
                        this.expand(initialSize);
                    }
                }
                acquire() {
                    if (this.freeList.length <= 0) {
                        this.expand(Math.round(this.count * 0.2) + 1);
                    }
                    var item = this.freeList.pop();
                    return item;
                }
                release(item) {
                    item.reset();
                    this.freeList.push(item);
                }
                expand(count) {
                    for (var n = 0; n < count; n++) {
                        var clone = new this.T();
                        clone._pool = this;
                        this.freeList.push(clone);
                    }
                    this.count += count;
                }
                totalSize() {
                    return this.count;
                }
                totalFree() {
                    return this.freeList.length;
                }
                totalUsed() {
                    return this.count - this.freeList.length;
                }
            };
            exports_1("ObjectPool", ObjectPool);
            EventDispatcher = class EventDispatcher {
                constructor() {
                    this._listeners = {};
                    this.stats = {
                        fired: 0,
                        handled: 0
                    };
                }
                addEventListener(eventName, listener) {
                    let listeners = this._listeners;
                    if (listeners[eventName] === undefined) {
                        listeners[eventName] = [];
                    }
                    if (listeners[eventName].indexOf(listener) === -1) {
                        listeners[eventName].push(listener);
                    }
                }
                hasEventListener(eventName, listener) {
                    return (this._listeners[eventName] !== undefined &&
                        this._listeners[eventName].indexOf(listener) !== -1);
                }
                removeEventListener(eventName, listener) {
                    var listenerArray = this._listeners[eventName];
                    if (listenerArray !== undefined) {
                        var index = listenerArray.indexOf(listener);
                        if (index !== -1) {
                            listenerArray.splice(index, 1);
                        }
                    }
                }
                dispatchEvent(eventName, entity, component) {
                    this.stats.fired++;
                    var listenerArray = this._listeners[eventName];
                    if (listenerArray !== undefined) {
                        var array = listenerArray.slice(0);
                        for (var i = 0; i < array.length; i++) {
                            array[i].call(this, entity, component);
                        }
                    }
                }
                resetCounters() {
                    this.stats.fired = this.stats.handled = 0;
                }
            };
            Query = class Query {
                constructor(Components, manager) {
                    this.Components = [];
                    this.NotComponents = [];
                    Components.forEach(component => {
                        if (typeof component === "object") {
                            this.NotComponents.push(component.Component);
                        }
                        else {
                            this.Components.push(component);
                        }
                    });
                    if (this.Components.length === 0) {
                        throw new Error("Can't create a query without components");
                    }
                    this.entities = [];
                    this.eventDispatcher = new EventDispatcher();
                    this.reactive = false;
                    this.key = queryKey(Components);
                    for (var i = 0; i < manager._entities.length; i++) {
                        var entity = manager._entities[i];
                        if (this.match(entity)) {
                            entity.queries.push(this);
                            this.entities.push(entity);
                        }
                    }
                }
                addEntity(entity) {
                    entity.queries.push(this);
                    this.entities.push(entity);
                    this.eventDispatcher.dispatchEvent(Query.prototype.ENTITY_ADDED, entity);
                }
                removeEntity(entity) {
                    let index = this.entities.indexOf(entity);
                    if (~index) {
                        this.entities.splice(index, 1);
                        index = entity.queries.indexOf(this);
                        entity.queries.splice(index, 1);
                        this.eventDispatcher.dispatchEvent(Query.prototype.ENTITY_REMOVED, entity);
                    }
                }
                match(entity) {
                    return (entity.hasAllComponents(this.Components) &&
                        !entity.hasAnyComponents(this.NotComponents));
                }
                toJSON() {
                    return {
                        key: this.key,
                        reactive: this.reactive,
                        components: {
                            included: this.Components.map(C => C.name),
                            not: this.NotComponents.map(C => C.name)
                        },
                        numEntities: this.entities.length
                    };
                }
                stats() {
                    return {
                        numComponents: this.Components.length,
                        numEntities: this.entities.length
                    };
                }
            };
            Query.prototype.ENTITY_ADDED = "Query#ENTITY_ADDED";
            Query.prototype.ENTITY_REMOVED = "Query#ENTITY_REMOVED";
            Query.prototype.COMPONENT_CHANGED = "Query#COMPONENT_CHANGED";
            QueryManager = class QueryManager {
                constructor(world) {
                    this._world = world;
                    this._queries = {};
                }
                onEntityRemoved(entity) {
                    for (var queryName in this._queries) {
                        var query = this._queries[queryName];
                        if (entity.queries.indexOf(query) !== -1) {
                            query.removeEntity(entity);
                        }
                    }
                }
                onEntityComponentAdded(entity, Component) {
                    for (var queryName in this._queries) {
                        var query = this._queries[queryName];
                        if (!!~query.NotComponents.indexOf(Component) &&
                            ~query.entities.indexOf(entity)) {
                            query.removeEntity(entity);
                            continue;
                        }
                        if (!~query.Components.indexOf(Component) ||
                            !query.match(entity) ||
                            ~query.entities.indexOf(entity))
                            continue;
                        query.addEntity(entity);
                    }
                }
                onEntityComponentRemoved(entity, Component) {
                    for (var queryName in this._queries) {
                        var query = this._queries[queryName];
                        if (!!~query.NotComponents.indexOf(Component) &&
                            !~query.entities.indexOf(entity) &&
                            query.match(entity)) {
                            query.addEntity(entity);
                            continue;
                        }
                        if (!!~query.Components.indexOf(Component) &&
                            !!~query.entities.indexOf(entity) &&
                            !query.match(entity)) {
                            query.removeEntity(entity);
                            continue;
                        }
                    }
                }
                getQuery(Components) {
                    var key = queryKey(Components);
                    var query = this._queries[key];
                    if (!query) {
                        this._queries[key] = query = new Query(Components, this._world);
                    }
                    return query;
                }
                stats() {
                    var stats = {};
                    for (var queryName in this._queries) {
                        stats[queryName] = this._queries[queryName].stats();
                    }
                    return stats;
                }
            };
            Component = class Component {
                constructor(props) {
                    if (props !== false) {
                        const schema = this.constructor.schema;
                        for (const key in schema) {
                            if (props && props.hasOwnProperty(key)) {
                                this[key] = props[key];
                            }
                            else {
                                const schemaProp = schema[key];
                                if (schemaProp.hasOwnProperty("default")) {
                                    this[key] = schemaProp.type.clone(schemaProp.default);
                                }
                                else {
                                    const type = schemaProp.type;
                                    this[key] = type.clone(type.default);
                                }
                            }
                        }
                    }
                    this._pool = null;
                }
                copy(source) {
                    const schema = this.constructor.schema;
                    for (const key in schema) {
                        const prop = schema[key];
                        if (source.hasOwnProperty(key)) {
                            this[key] = prop.type.copy(source[key], this[key]);
                        }
                    }
                    return this;
                }
                clone() {
                    return new this.constructor().copy(this);
                }
                reset() {
                    const schema = this.constructor.schema;
                    for (const key in schema) {
                        const schemaProp = schema[key];
                        if (schemaProp.hasOwnProperty("default")) {
                            this[key] = schemaProp.type.copy(schemaProp.default, this[key]);
                        }
                        else {
                            const type = schemaProp.type;
                            this[key] = type.copy(type.default, this[key]);
                        }
                    }
                }
                dispose() {
                    if (this._pool) {
                        this._pool.release(this);
                    }
                }
            };
            exports_1("Component", Component);
            Component.schema = {};
            Component.isComponent = true;
            SystemStateComponent = class SystemStateComponent extends Component {
            };
            exports_1("SystemStateComponent", SystemStateComponent);
            SystemStateComponent.isSystemStateComponent = true;
            EntityPool = class EntityPool extends ObjectPool {
                constructor(entityManager, entityClass, initialSize) {
                    super(entityClass, undefined);
                    this.entityManager = entityManager;
                    if (typeof initialSize !== "undefined") {
                        this.expand(initialSize);
                    }
                }
                expand(count) {
                    for (var n = 0; n < count; n++) {
                        var clone = new this.T(this.entityManager);
                        clone._pool = this;
                        this.freeList.push(clone);
                    }
                    this.count += count;
                }
            };
            EntityManager = class EntityManager {
                constructor(world) {
                    this.world = world;
                    this.componentsManager = world.componentsManager;
                    this._entities = [];
                    this._nextEntityId = 0;
                    this._entitiesByNames = {};
                    this._queryManager = new QueryManager(this);
                    this.eventDispatcher = new EventDispatcher();
                    this._entityPool = new EntityPool(this, this.world.options.entityClass, this.world.options.entityPoolSize);
                    this.entitiesWithComponentsToRemove = [];
                    this.entitiesToRemove = [];
                    this.deferredRemovalEnabled = true;
                }
                getEntityByName(name) {
                    return this._entitiesByNames[name];
                }
                createEntity(name) {
                    var entity = this._entityPool.acquire();
                    entity.alive = true;
                    entity.name = name || "";
                    if (name) {
                        if (this._entitiesByNames[name]) {
                            console.warn(`Entity name '${name}' already exist`);
                        }
                        else {
                            this._entitiesByNames[name] = entity;
                        }
                    }
                    this._entities.push(entity);
                    this.eventDispatcher.dispatchEvent(ENTITY_CREATED, entity);
                    return entity;
                }
                entityAddComponent(entity, Component, values) {
                    if (!this.world.componentsManager.Components[Component.name]) {
                        throw new Error(`Attempted to add unregistered component "${Component.name}"`);
                    }
                    if (~entity._ComponentTypes.indexOf(Component)) {
                        console.warn("Component type already exists on entity.", entity, Component.name);
                        return;
                    }
                    entity._ComponentTypes.push(Component);
                    if (Component.__proto__ === SystemStateComponent) {
                        entity.numStateComponents++;
                    }
                    var componentPool = this.world.componentsManager.getComponentsPool(Component);
                    var component = componentPool
                        ? componentPool.acquire()
                        : new Component(values);
                    if (componentPool && values) {
                        component.copy(values);
                    }
                    entity._components[Component.name] = component;
                    this._queryManager.onEntityComponentAdded(entity, Component);
                    this.world.componentsManager.componentAddedToEntity(Component);
                    this.eventDispatcher.dispatchEvent(COMPONENT_ADDED, entity, Component);
                }
                entityRemoveComponent(entity, Component, immediately) {
                    var index = entity._ComponentTypes.indexOf(Component);
                    if (!~index)
                        return;
                    this.eventDispatcher.dispatchEvent(COMPONENT_REMOVE, entity, Component);
                    if (immediately) {
                        this._entityRemoveComponentSync(entity, Component, index);
                    }
                    else {
                        if (entity._ComponentTypesToRemove.length === 0)
                            this.entitiesWithComponentsToRemove.push(entity);
                        entity._ComponentTypes.splice(index, 1);
                        entity._ComponentTypesToRemove.push(Component);
                        var componentName = getName(Component);
                        entity._componentsToRemove[componentName] =
                            entity._components[componentName];
                        delete entity._components[componentName];
                    }
                    this._queryManager.onEntityComponentRemoved(entity, Component);
                    if (Component.__proto__ === SystemStateComponent) {
                        entity.numStateComponents--;
                        if (entity.numStateComponents === 0 && !entity.alive) {
                            entity.remove();
                        }
                    }
                }
                _entityRemoveComponentSync(entity, Component, index) {
                    entity._ComponentTypes.splice(index, 1);
                    var componentName = getName(Component);
                    var component = entity._components[componentName];
                    delete entity._components[componentName];
                    component.dispose();
                    this.world.componentsManager.componentRemovedFromEntity(Component);
                }
                entityRemoveAllComponents(entity, immediately) {
                    let Components = entity._ComponentTypes;
                    for (let j = Components.length - 1; j >= 0; j--) {
                        if (Components[j].__proto__ !== SystemStateComponent)
                            this.entityRemoveComponent(entity, Components[j], immediately);
                    }
                }
                removeEntity(entity, immediately) {
                    var index = this._entities.indexOf(entity);
                    if (!~index)
                        throw new Error("Tried to remove entity not in list");
                    entity.alive = false;
                    if (entity.numStateComponents === 0) {
                        this.eventDispatcher.dispatchEvent(ENTITY_REMOVED, entity);
                        this._queryManager.onEntityRemoved(entity);
                        if (immediately === true) {
                            this._releaseEntity(entity, index);
                        }
                        else {
                            this.entitiesToRemove.push(entity);
                        }
                    }
                    this.entityRemoveAllComponents(entity, immediately);
                }
                _releaseEntity(entity, index) {
                    this._entities.splice(index, 1);
                    if (this._entitiesByNames[entity.name]) {
                        delete this._entitiesByNames[entity.name];
                    }
                    entity._pool.release(entity);
                }
                removeAllEntities() {
                    for (var i = this._entities.length - 1; i >= 0; i--) {
                        this.removeEntity(this._entities[i]);
                    }
                }
                processDeferredRemoval() {
                    if (!this.deferredRemovalEnabled) {
                        return;
                    }
                    for (let i = 0; i < this.entitiesToRemove.length; i++) {
                        let entity = this.entitiesToRemove[i];
                        let index = this._entities.indexOf(entity);
                        this._releaseEntity(entity, index);
                    }
                    this.entitiesToRemove.length = 0;
                    for (let i = 0; i < this.entitiesWithComponentsToRemove.length; i++) {
                        let entity = this.entitiesWithComponentsToRemove[i];
                        while (entity._ComponentTypesToRemove.length > 0) {
                            let Component = entity._ComponentTypesToRemove.pop();
                            var componentName = getName(Component);
                            var component = entity._componentsToRemove[componentName];
                            delete entity._componentsToRemove[componentName];
                            component.dispose();
                            this.world.componentsManager.componentRemovedFromEntity(Component);
                        }
                    }
                    this.entitiesWithComponentsToRemove.length = 0;
                }
                queryComponents(Components) {
                    return this._queryManager.getQuery(Components);
                }
                count() {
                    return this._entities.length;
                }
                stats() {
                    var stats = {
                        numEntities: this._entities.length,
                        numQueries: Object.keys(this._queryManager._queries).length,
                        queries: this._queryManager.stats(),
                        numComponentPool: Object.keys(this.componentsManager._componentPool)
                            .length,
                        componentPool: {},
                        eventDispatcher: this.eventDispatcher.stats
                    };
                    for (var cname in this.componentsManager._componentPool) {
                        var pool = this.componentsManager._componentPool[cname];
                        stats.componentPool[cname] = {
                            used: pool.totalUsed(),
                            size: pool.count
                        };
                    }
                    return stats;
                }
            };
            ENTITY_CREATED = "EntityManager#ENTITY_CREATE";
            ENTITY_REMOVED = "EntityManager#ENTITY_REMOVED";
            COMPONENT_ADDED = "EntityManager#COMPONENT_ADDED";
            COMPONENT_REMOVE = "EntityManager#COMPONENT_REMOVE";
            ComponentManager = class ComponentManager {
                constructor() {
                    this.Components = {};
                    this._componentPool = {};
                    this.numComponents = {};
                }
                registerComponent(Component, objectPool) {
                    if (this.Components[Component.name]) {
                        console.warn(`Component type: '${Component.name}' already registered.`);
                        return;
                    }
                    const schema = Component.schema;
                    if (!schema) {
                        throw new Error(`Component "${Component.name}" has no schema property.`);
                    }
                    for (const propName in schema) {
                        const prop = schema[propName];
                        if (!prop.type) {
                            throw new Error(`Invalid schema for component "${Component.name}". Missing type for "${propName}" property.`);
                        }
                    }
                    this.Components[Component.name] = Component;
                    this.numComponents[Component.name] = 0;
                    if (objectPool === undefined) {
                        objectPool = new ObjectPool(Component);
                    }
                    else if (objectPool === false) {
                        objectPool = undefined;
                    }
                    this._componentPool[Component.name] = objectPool;
                }
                componentAddedToEntity(Component) {
                    if (!this.Components[Component.name]) {
                        this.registerComponent(Component);
                    }
                    this.numComponents[Component.name]++;
                }
                componentRemovedFromEntity(Component) {
                    this.numComponents[Component.name]--;
                }
                getComponentsPool(Component) {
                    var componentName = componentPropertyName(Component);
                    return this._componentPool[componentName];
                }
            };
            Version = "0.3.1";
            exports_1("Version", Version);
            Entity = class Entity {
                constructor(entityManager) {
                    this._entityManager = entityManager || null;
                    this.id = entityManager._nextEntityId++;
                    this._ComponentTypes = [];
                    this._components = {};
                    this._componentsToRemove = {};
                    this.queries = [];
                    this._ComponentTypesToRemove = [];
                    this.alive = false;
                    this.numStateComponents = 0;
                }
                getComponent(Component, includeRemoved) {
                    var component = this._components[Component.name];
                    if (!component && includeRemoved === true) {
                        component = this._componentsToRemove[Component.name];
                    }
                    return component;
                }
                getRemovedComponent(Component) {
                    return this._componentsToRemove[Component.name];
                }
                getComponents() {
                    return this._components;
                }
                getComponentsToRemove() {
                    return this._componentsToRemove;
                }
                getComponentTypes() {
                    return this._ComponentTypes;
                }
                getMutableComponent(Component) {
                    var component = this._components[Component.name];
                    for (var i = 0; i < this.queries.length; i++) {
                        var query = this.queries[i];
                        if (query.reactive && query.Components.indexOf(Component) !== -1) {
                            query.eventDispatcher.dispatchEvent(Query.prototype.COMPONENT_CHANGED, this, component);
                        }
                    }
                    return component;
                }
                addComponent(Component, values) {
                    this._entityManager.entityAddComponent(this, Component, values);
                    return this;
                }
                removeComponent(Component, forceImmediate) {
                    this._entityManager.entityRemoveComponent(this, Component, forceImmediate);
                    return this;
                }
                hasComponent(Component, includeRemoved) {
                    return (!!~this._ComponentTypes.indexOf(Component) ||
                        (includeRemoved === true && this.hasRemovedComponent(Component)));
                }
                hasRemovedComponent(Component) {
                    return !!~this._ComponentTypesToRemove.indexOf(Component);
                }
                hasAllComponents(Components) {
                    for (var i = 0; i < Components.length; i++) {
                        if (!this.hasComponent(Components[i]))
                            return false;
                    }
                    return true;
                }
                hasAnyComponents(Components) {
                    for (var i = 0; i < Components.length; i++) {
                        if (this.hasComponent(Components[i]))
                            return true;
                    }
                    return false;
                }
                removeAllComponents(forceImmediate) {
                    return this._entityManager.entityRemoveAllComponents(this, forceImmediate);
                }
                copy(src) {
                    for (var componentName in src._components) {
                        var srcComponent = src._components[componentName];
                        this.addComponent(srcComponent.constructor);
                        var component = this.getComponent(srcComponent.constructor);
                        component.copy(srcComponent);
                    }
                    return this;
                }
                clone() {
                    return new Entity(this._entityManager).copy(this);
                }
                reset() {
                    this.id = this._entityManager._nextEntityId++;
                    this._ComponentTypes.length = 0;
                    this.queries.length = 0;
                    for (var componentName in this._components) {
                        delete this._components[componentName];
                    }
                }
                remove(forceImmediate) {
                    return this._entityManager.removeEntity(this, forceImmediate);
                }
            };
            exports_1("_Entity", Entity);
            DEFAULT_OPTIONS = {
                entityPoolSize: 0,
                entityClass: Entity
            };
            World = class World {
                constructor(options = {}) {
                    this.options = Object.assign({}, DEFAULT_OPTIONS, options);
                    this.componentsManager = new ComponentManager(this);
                    this.entityManager = new EntityManager(this);
                    this.systemManager = new SystemManager(this);
                    this.enabled = true;
                    this.eventQueues = {};
                    if (hasWindow && typeof CustomEvent !== "undefined") {
                        var event = new CustomEvent("ecsy-world-created", {
                            detail: { world: this, version: Version }
                        });
                        window.dispatchEvent(event);
                    }
                    this.lastTime = now();
                }
                registerComponent(Component, objectPool) {
                    this.componentsManager.registerComponent(Component, objectPool);
                    return this;
                }
                registerSystem(System, attributes) {
                    this.systemManager.registerSystem(System, attributes);
                    return this;
                }
                unregisterSystem(System) {
                    this.systemManager.unregisterSystem(System);
                    return this;
                }
                getSystem(SystemClass) {
                    return this.systemManager.getSystem(SystemClass);
                }
                getSystems() {
                    return this.systemManager.getSystems();
                }
                execute(delta, time) {
                    if (!delta) {
                        time = now();
                        delta = time - this.lastTime;
                        this.lastTime = time;
                    }
                    if (this.enabled) {
                        this.systemManager.execute(delta, time);
                        this.entityManager.processDeferredRemoval();
                    }
                }
                stop() {
                    this.enabled = false;
                }
                play() {
                    this.enabled = true;
                }
                createEntity(name) {
                    return this.entityManager.createEntity(name);
                }
                stats() {
                    var stats = {
                        entities: this.entityManager.stats(),
                        system: this.systemManager.stats()
                    };
                    console.log(JSON.stringify(stats, null, 2));
                }
            };
            exports_1("World", World);
            System = class System {
                canExecute() {
                    if (this._mandatoryQueries.length === 0)
                        return true;
                    for (let i = 0; i < this._mandatoryQueries.length; i++) {
                        var query = this._mandatoryQueries[i];
                        if (query.entities.length === 0) {
                            return false;
                        }
                    }
                    return true;
                }
                constructor(world, attributes) {
                    this.world = world;
                    this.enabled = true;
                    this._queries = {};
                    this.queries = {};
                    this.priority = 0;
                    this.executeTime = 0;
                    if (attributes && attributes.priority) {
                        this.priority = attributes.priority;
                    }
                    this._mandatoryQueries = [];
                    this.initialized = true;
                    if (this.constructor.queries) {
                        for (var queryName in this.constructor.queries) {
                            var queryConfig = this.constructor.queries[queryName];
                            var Components = queryConfig.components;
                            if (!Components || Components.length === 0) {
                                throw new Error("'components' attribute can't be empty in a query");
                            }
                            var query = this.world.entityManager.queryComponents(Components);
                            this._queries[queryName] = query;
                            if (queryConfig.mandatory === true) {
                                this._mandatoryQueries.push(query);
                            }
                            this.queries[queryName] = {
                                results: query.entities
                            };
                            var validEvents = ["added", "removed", "changed"];
                            const eventMapping = {
                                added: Query.prototype.ENTITY_ADDED,
                                removed: Query.prototype.ENTITY_REMOVED,
                                changed: Query.prototype.COMPONENT_CHANGED
                            };
                            if (queryConfig.listen) {
                                validEvents.forEach(eventName => {
                                    if (!this.execute) {
                                        console.warn(`System '${this.constructor.name}' has defined listen events (${validEvents.join(", ")}) for query '${queryName}' but it does not implement the 'execute' method.`);
                                    }
                                    if (queryConfig.listen[eventName]) {
                                        let event = queryConfig.listen[eventName];
                                        if (eventName === "changed") {
                                            query.reactive = true;
                                            if (event === true) {
                                                let eventList = (this.queries[queryName][eventName] = []);
                                                query.eventDispatcher.addEventListener(Query.prototype.COMPONENT_CHANGED, entity => {
                                                    if (eventList.indexOf(entity) === -1) {
                                                        eventList.push(entity);
                                                    }
                                                });
                                            }
                                            else if (Array.isArray(event)) {
                                                let eventList = (this.queries[queryName][eventName] = []);
                                                query.eventDispatcher.addEventListener(Query.prototype.COMPONENT_CHANGED, (entity, changedComponent) => {
                                                    if (event.indexOf(changedComponent.constructor) !== -1 &&
                                                        eventList.indexOf(entity) === -1) {
                                                        eventList.push(entity);
                                                    }
                                                });
                                            }
                                        }
                                        else {
                                            let eventList = (this.queries[queryName][eventName] = []);
                                            query.eventDispatcher.addEventListener(eventMapping[eventName], entity => {
                                                if (eventList.indexOf(entity) === -1)
                                                    eventList.push(entity);
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    }
                }
                stop() {
                    this.executeTime = 0;
                    this.enabled = false;
                }
                play() {
                    this.enabled = true;
                }
                clearEvents() {
                    for (let queryName in this.queries) {
                        var query = this.queries[queryName];
                        if (query.added) {
                            query.added.length = 0;
                        }
                        if (query.removed) {
                            query.removed.length = 0;
                        }
                        if (query.changed) {
                            if (Array.isArray(query.changed)) {
                                query.changed.length = 0;
                            }
                            else {
                                for (let name in query.changed) {
                                    query.changed[name].length = 0;
                                }
                            }
                        }
                    }
                }
                toJSON() {
                    var json = {
                        name: this.constructor.name,
                        enabled: this.enabled,
                        executeTime: this.executeTime,
                        priority: this.priority,
                        queries: {}
                    };
                    if (this.constructor.queries) {
                        var queries = this.constructor.queries;
                        for (let queryName in queries) {
                            let query = this.queries[queryName];
                            let queryDefinition = queries[queryName];
                            let jsonQuery = (json.queries[queryName] = {
                                key: this._queries[queryName].key
                            });
                            jsonQuery.mandatory = queryDefinition.mandatory === true;
                            jsonQuery.reactive =
                                queryDefinition.listen &&
                                    (queryDefinition.listen.added === true ||
                                        queryDefinition.listen.removed === true ||
                                        queryDefinition.listen.changed === true ||
                                        Array.isArray(queryDefinition.listen.changed));
                            if (jsonQuery.reactive) {
                                jsonQuery.listen = {};
                                const methods = ["added", "removed", "changed"];
                                methods.forEach(method => {
                                    if (query[method]) {
                                        jsonQuery.listen[method] = {
                                            entities: query[method].length
                                        };
                                    }
                                });
                            }
                        }
                    }
                    return json;
                }
            };
            exports_1("System", System);
            System.isSystem = true;
            TagComponent = class TagComponent extends Component {
                constructor() {
                    super(false);
                }
            };
            exports_1("TagComponent", TagComponent);
            TagComponent.isTagComponent = true;
            copyValue = src => src;
            exports_1("copyValue", copyValue);
            cloneValue = src => src;
            exports_1("cloneValue", cloneValue);
            copyArray = (src, dest) => {
                const srcArray = src;
                const destArray = dest;
                destArray.length = 0;
                for (let i = 0; i < srcArray.length; i++) {
                    destArray.push(srcArray[i]);
                }
                return destArray;
            };
            exports_1("copyArray", copyArray);
            cloneArray = src => src.slice();
            exports_1("cloneArray", cloneArray);
            copyJSON = src => JSON.parse(JSON.stringify(src));
            exports_1("copyJSON", copyJSON);
            cloneJSON = src => JSON.parse(JSON.stringify(src));
            exports_1("cloneJSON", cloneJSON);
            copyCopyable = (src, dest) => dest.copy(src);
            exports_1("copyCopyable", copyCopyable);
            cloneClonable = src => src.clone();
            exports_1("cloneClonable", cloneClonable);
            Types = {
                Number: createType({
                    name: "Number",
                    default: 0,
                    copy: copyValue,
                    clone: cloneValue
                }),
                Boolean: createType({
                    name: "Boolean",
                    default: false,
                    copy: copyValue,
                    clone: cloneValue
                }),
                String: createType({
                    name: "String",
                    default: "",
                    copy: copyValue,
                    clone: cloneValue
                }),
                Array: createType({
                    name: "Array",
                    default: [],
                    copy: copyArray,
                    clone: cloneArray
                }),
                Ref: createType({
                    name: "Ref",
                    default: undefined,
                    copy: copyValue,
                    clone: cloneValue
                }),
                JSON: createType({
                    name: "JSON",
                    default: null,
                    copy: copyJSON,
                    clone: cloneJSON
                })
            };
            exports_1("Types", Types);
            if (hasWindow) {
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.has("enable-remote-devtools")) {
                    enableRemoteDevtools();
                }
            }
        }
    };
});
System.register("file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/deps/ecsy", ["https://ecsy.io/build/ecsy.module"], function (exports_2, context_2) {
    "use strict";
    var ecsy_module_js_1;
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [
            function (ecsy_module_js_1_1) {
                ecsy_module_js_1 = ecsy_module_js_1_1;
            }
        ],
        execute: function () {
            exports_2("World", ecsy_module_js_1.World);
            exports_2("System", ecsy_module_js_1.System);
            exports_2("Component", ecsy_module_js_1.Component);
            exports_2("_Entity", ecsy_module_js_1._Entity);
            exports_2("TagComponent", ecsy_module_js_1.TagComponent);
            exports_2("Types", ecsy_module_js_1.Types);
            exports_2("createType", ecsy_module_js_1.createType);
        }
    };
});
System.register("https://deno.land/x/events/mod", [], function (exports_3, context_3) {
    "use strict";
    var EventEmitter;
    var __moduleName = context_3 && context_3.id;
    return {
        setters: [],
        execute: function () {
            EventEmitter = class EventEmitter {
                constructor() {
                    this.events = new Map();
                    this.#defaultMaxListeners = 10;
                }
                #defaultMaxListeners;
                get defaultMaxListeners() {
                    return this.#defaultMaxListeners;
                }
                set defaultMaxListeners(n) {
                    if (Number.isInteger(n) || n < 0) {
                        const error = new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative integer. Received ' +
                            n +
                            ".");
                        throw error;
                    }
                    this.#defaultMaxListeners = n;
                }
                addListener(eventName, listener) {
                    return this.on(eventName, listener);
                }
                emit(eventName, ...args) {
                    const listeners = this.events.get(eventName);
                    if (listeners === undefined) {
                        if (eventName === "error") {
                            const error = args[0];
                            if (error instanceof Error)
                                throw error;
                            throw new Error("Unhandled error.");
                        }
                        return false;
                    }
                    const copyListeners = [...listeners];
                    for (const listener of copyListeners) {
                        listener.apply(this, args);
                    }
                    return true;
                }
                setMaxListeners(n) {
                    if (!Number.isInteger(n) || n < 0) {
                        throw new RangeError('The value of "n" is out of range. It must be a non-negative integer. Received ' +
                            n +
                            ".");
                    }
                    this.maxListeners = n;
                    return this;
                }
                getMaxListeners() {
                    if (this.maxListeners === undefined) {
                        return this.defaultMaxListeners;
                    }
                    return this.maxListeners;
                }
                listenerCount(eventName) {
                    const events = this.events.get(eventName);
                    return events === undefined ? 0 : events.length;
                }
                eventNames() {
                    return Reflect.ownKeys(this.events);
                }
                listeners(eventName) {
                    const listeners = this.events.get(eventName);
                    return listeners === undefined ? [] : listeners;
                }
                off(eventName, listener) {
                    return this.removeListener(eventName, listener);
                }
                on(eventName, listener, prepend) {
                    if (this.events.has(eventName) === false) {
                        this.events.set(eventName, []);
                    }
                    const events = this.events.get(eventName);
                    if (prepend) {
                        events.unshift(listener);
                    }
                    else {
                        events.push(listener);
                    }
                    if (eventName !== "newListener" && this.events.has("newListener")) {
                        this.emit("newListener", eventName, listener);
                    }
                    const maxListener = this.getMaxListeners();
                    const eventLength = events.length;
                    if (maxListener > 0 && eventLength > maxListener && !events.warned) {
                        events.warned = true;
                        const warning = new Error(`Possible EventEmitter memory leak detected.
         ${this.listenerCount(eventName)} ${eventName.toString()} listeners.
         Use emitter.setMaxListeners() to increase limit`);
                        warning.name = "MaxListenersExceededWarning";
                        console.warn(warning);
                    }
                    return this;
                }
                removeAllListeners(eventName) {
                    const events = this.events;
                    if (!events.has("removeListener")) {
                        if (arguments.length === 0) {
                            this.events = new Map();
                        }
                        else if (events.has(eventName)) {
                            events.delete(eventName);
                        }
                        return this;
                    }
                    if (arguments.length === 0) {
                        for (const key of events.keys()) {
                            if (key === "removeListener")
                                continue;
                            this.removeAllListeners(key);
                        }
                        this.removeAllListeners("removeListener");
                        this.events = new Map();
                        return this;
                    }
                    const listeners = events.get(eventName);
                    if (listeners !== undefined) {
                        listeners.map((listener) => {
                            this.removeListener(eventName, listener);
                        });
                    }
                    return this;
                }
                removeListener(eventName, listener) {
                    const events = this.events;
                    if (events.size === 0)
                        return this;
                    const list = events.get(eventName);
                    if (list === undefined)
                        return this;
                    const index = list.findIndex((item) => item === listener || item.listener === listener);
                    if (index === -1)
                        return this;
                    list.splice(index, 1);
                    if (list.length === 0)
                        this.events.delete(eventName);
                    if (events.has("removeListener")) {
                        this.emit("removeListener", eventName, listener);
                    }
                    return this;
                }
                once(eventName, listener) {
                    this.on(eventName, this.onceWrap(eventName, listener));
                    return this;
                }
                onceWrap(eventName, listener) {
                    const wrapper = function (...args) {
                        this.context.removeListener(this.eventName, this.wrapedListener);
                        this.listener.apply(this.context, args);
                    };
                    const wrapperContext = {
                        eventName: eventName,
                        listener: listener,
                        wrapedListener: wrapper,
                        context: this,
                    };
                    const wrapped = wrapper.bind(wrapperContext);
                    wrapperContext.wrapedListener = wrapped;
                    wrapped.listener = listener;
                    return wrapped;
                }
                prependListener(eventName, listener) {
                    return this.on(eventName, listener, true);
                }
                prependOnceListener(eventName, listener) {
                    this.prependListener(eventName, this.onceWrap(eventName, listener));
                    return this;
                }
                rawListeners(eventName) {
                    const events = this.events;
                    if (events === undefined)
                        return [];
                    const listeners = events.get(eventName);
                    if (listeners === undefined)
                        return [];
                    return [...listeners];
                }
            };
            exports_3("default", EventEmitter);
        }
    };
});
System.register("file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/deps/eventEmitter", ["https://deno.land/x/events/mod"], function (exports_4, context_4) {
    "use strict";
    var mod_ts_1;
    var __moduleName = context_4 && context_4.id;
    return {
        setters: [
            function (mod_ts_1_1) {
                mod_ts_1 = mod_ts_1_1;
            }
        ],
        execute: function () {
            exports_4("default", mod_ts_1.default);
        }
    };
});
System.register("file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/emitters/ScoreEmitter", ["file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/deps/eventEmitter"], function (exports_5, context_5) {
    "use strict";
    var eventEmitter_ts_1, ScoreEmitter;
    var __moduleName = context_5 && context_5.id;
    return {
        setters: [
            function (eventEmitter_ts_1_1) {
                eventEmitter_ts_1 = eventEmitter_ts_1_1;
            }
        ],
        execute: function () {
            ScoreEmitter = class ScoreEmitter extends eventEmitter_ts_1.default {
            };
            exports_5("default", ScoreEmitter);
        }
    };
});
System.register("file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/ui/ScoreBoard/public/build/bundle", [], function (exports_6, context_6) {
    "use strict";
    var p, g, $, m, y, x, b, v, w, A, B;
    var __moduleName = context_6 && context_6.id;
    function t() { }
    function e(t) { return t(); }
    function n() { return Object.create(null); }
    function r(t) { t.forEach(e); }
    function o(t) { return "function" == typeof t; }
    function c(t, e) { return t != t ? e == e : t !== e || t && "object" == typeof t || "function" == typeof t; }
    function u(t, e) { t.appendChild(e); }
    function f(t) { t.parentNode.removeChild(t); }
    function i(t) { return document.createElement(t); }
    function a(t) { return document.createTextNode(t); }
    function l() { return a(" "); }
    function s(t, e, n) { null == n ? t.removeAttribute(e) : t.getAttribute(e) !== n && t.setAttribute(e, n); }
    function d(t, e) { e = "" + e, t.wholeText !== e && (t.data = e); }
    function h(t) { p = t; }
    function _(t) { m.push(t); }
    function S() { if (!v) {
        v = !0;
        do {
            for (let t = 0; t < g.length; t += 1) {
                const e = g[t];
                h(e), E(e.$$);
            }
            for (g.length = 0; $.length;)
                $.pop()();
            for (let t = 0; t < m.length; t += 1) {
                const e = m[t];
                w.has(e) || (w.add(e), e());
            }
            m.length = 0;
        } while (g.length);
        for (; y.length;)
            y.pop()();
        b = !1, v = !1, w.clear();
    } }
    function E(t) { if (null !== t.fragment) {
        t.update(), r(t.before_update);
        const e = t.dirty;
        t.dirty = [-1], t.fragment && t.fragment.p(t.ctx, e), t.after_update.forEach(_);
    } }
    function k(t, e) { -1 === t.$$.dirty[0] && (g.push(t), b || (b = !0, x.then(S)), t.$$.dirty.fill(0)), t.$$.dirty[e / 31 | 0] |= 1 << e % 31; }
    function C(c, u, i, a, l, s, d = [-1]) { const g = p; h(c); const $ = u.props || {}, m = c.$$ = { fragment: null, ctx: null, props: s, update: t, not_equal: l, bound: n(), on_mount: [], on_destroy: [], before_update: [], after_update: [], context: new Map(g ? g.$$.context : []), callbacks: n(), dirty: d }; let y = !1; if (m.ctx = i ? i(c, $, (t, e, ...n) => { const r = n.length ? n[0] : e; return m.ctx && l(m.ctx[t], m.ctx[t] = r) && (m.bound[t] && m.bound[t](r), y && k(c, t)), e; }) : [], m.update(), y = !0, r(m.before_update), m.fragment = !!a && a(m.ctx), u.target) {
        if (u.hydrate) {
            const t = function (t) { return Array.from(t.childNodes); }(u.target);
            m.fragment && m.fragment.l(t), t.forEach(f);
        }
        else
            m.fragment && m.fragment.c();
        u.intro && ((x = c.$$.fragment) && x.i && (A.delete(x), x.i(b))), function (t, n, c) { const { fragment: u, on_mount: f, on_destroy: i, after_update: a } = t.$$; u && u.m(n, c), _(() => { const n = f.map(e).filter(o); i ? i.push(...n) : r(n), t.$$.on_mount = []; }), a.forEach(_); }(c, u.target, u.anchor), S();
    } var x, b; h(g); }
    function N(e) { let n, r, o, c, p, h, g, $; return { c() { n = i("div"), r = i("h1"), o = a(e[0]), c = l(), p = i("h1"), p.textContent = "|", h = l(), g = i("h1"), $ = a(e[1]), s(r, "class", "left svelte-2rifwi"), s(p, "class", "center svelte-2rifwi"), s(g, "class", "right svelte-2rifwi"), s(n, "class", "grid-container svelte-2rifwi"); }, m(t, e) { !function (t, e, n) { t.insertBefore(e, n || null); }(t, n, e), u(n, r), u(r, o), u(n, c), u(n, p), u(n, h), u(n, g), u(g, $); }, p(t, [e]) { 1 & e && d(o, t[0]), 2 & e && d($, t[1]); }, i: t, o: t, d(t) { t && f(n); } }; }
    function j(t, e, n) { let r = 0, o = 0; return [r, o, t => { const { playerScored: e } = t; 1 === e ? n(0, r += 1) : 2 === e && n(1, o += 1); }]; }
    return {
        setters: [],
        execute: function () {
            g = [], $ = [], m = [], y = [], x = Promise.resolve();
            b = !1;
            v = !1;
            w = new Set;
            A = new Set;
            B = class B extends class {
                $destroy() { !function (t, e) { const n = t.$$; null !== n.fragment && (r(n.on_destroy), n.fragment && n.fragment.d(e), n.on_destroy = n.fragment = null, n.ctx = []); }(this, 1), this.$destroy = t; }
                $on(t, e) { const n = this.$$.callbacks[t] || (this.$$.callbacks[t] = []); return n.push(e), () => { const t = n.indexOf(e); -1 !== t && n.splice(t, 1); }; }
                $set() { }
            } {
                constructor(t) { super(), C(this, t, j, N, c, { updateScore: 2 }); }
                get updateScore() { return this.$$.ctx[2]; }
            };
            exports_6("ScoreBoard", B);
        }
    };
});
System.register("file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/gameControls", [], function (exports_7, context_7) {
    "use strict";
    var __moduleName = context_7 && context_7.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/Position", ["file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/deps/ecsy"], function (exports_8, context_8) {
    "use strict";
    var ecsy_ts_1, Position;
    var __moduleName = context_8 && context_8.id;
    return {
        setters: [
            function (ecsy_ts_1_1) {
                ecsy_ts_1 = ecsy_ts_1_1;
            }
        ],
        execute: function () {
            Position = class Position extends ecsy_ts_1.Component {
            };
            Position.schema = {
                x: { type: ecsy_ts_1.Types.Number },
                y: { type: ecsy_ts_1.Types.Number }
            };
            exports_8("default", Position);
        }
    };
});
System.register("file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/Velocity", ["file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/deps/ecsy"], function (exports_9, context_9) {
    "use strict";
    var ecsy_ts_2, Velocity;
    var __moduleName = context_9 && context_9.id;
    return {
        setters: [
            function (ecsy_ts_2_1) {
                ecsy_ts_2 = ecsy_ts_2_1;
            }
        ],
        execute: function () {
            Velocity = class Velocity extends ecsy_ts_2.Component {
            };
            Velocity.schema = {
                x: { type: ecsy_ts_2.Types.Number },
                y: { type: ecsy_ts_2.Types.Number }
            };
            exports_9("default", Velocity);
        }
    };
});
System.register("file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/Shape", ["file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/deps/ecsy"], function (exports_10, context_10) {
    "use strict";
    var ecsy_ts_3, Shape;
    var __moduleName = context_10 && context_10.id;
    return {
        setters: [
            function (ecsy_ts_3_1) {
                ecsy_ts_3 = ecsy_ts_3_1;
            }
        ],
        execute: function () {
            Shape = class Shape extends ecsy_ts_3.Component {
            };
            Shape.schema = {
                primitive: {
                    type: ecsy_ts_3.Types.String,
                    default: "box"
                }
            };
            exports_10("default", Shape);
        }
    };
});
System.register("file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/Renderable", ["file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/deps/ecsy"], function (exports_11, context_11) {
    "use strict";
    var ecsy_ts_4, Renderable;
    var __moduleName = context_11 && context_11.id;
    return {
        setters: [
            function (ecsy_ts_4_1) {
                ecsy_ts_4 = ecsy_ts_4_1;
            }
        ],
        execute: function () {
            Renderable = class Renderable extends ecsy_ts_4.TagComponent {
            };
            exports_11("default", Renderable);
        }
    };
});
System.register("file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/TwoDimensions", ["file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/deps/ecsy"], function (exports_12, context_12) {
    "use strict";
    var ecsy_ts_5, TwoDimensions;
    var __moduleName = context_12 && context_12.id;
    return {
        setters: [
            function (ecsy_ts_5_1) {
                ecsy_ts_5 = ecsy_ts_5_1;
            }
        ],
        execute: function () {
            TwoDimensions = class TwoDimensions extends ecsy_ts_5.Component {
            };
            TwoDimensions.schema = {
                width: { type: ecsy_ts_5.Types.Number },
                height: { type: ecsy_ts_5.Types.Number }
            };
            exports_12("default", TwoDimensions);
        }
    };
});
System.register("file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/AxisAlignedBoundingBox", ["file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/deps/ecsy"], function (exports_13, context_13) {
    "use strict";
    var ecsy_ts_6, AxisAlignedBoundingBox;
    var __moduleName = context_13 && context_13.id;
    return {
        setters: [
            function (ecsy_ts_6_1) {
                ecsy_ts_6 = ecsy_ts_6_1;
            }
        ],
        execute: function () {
            AxisAlignedBoundingBox = class AxisAlignedBoundingBox extends ecsy_ts_6.Component {
            };
            AxisAlignedBoundingBox.schema = {
                left: { type: ecsy_ts_6.Types.Number },
                right: { type: ecsy_ts_6.Types.Number },
                top: { type: ecsy_ts_6.Types.Number },
                bottom: { type: ecsy_ts_6.Types.Number }
            };
            exports_13("default", AxisAlignedBoundingBox);
        }
    };
});
System.register("file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/ControllerTag", ["file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/deps/ecsy"], function (exports_14, context_14) {
    "use strict";
    var ecsy_ts_7, ControllerTag;
    var __moduleName = context_14 && context_14.id;
    return {
        setters: [
            function (ecsy_ts_7_1) {
                ecsy_ts_7 = ecsy_ts_7_1;
            }
        ],
        execute: function () {
            ControllerTag = class ControllerTag extends ecsy_ts_7.TagComponent {
            };
            exports_14("default", ControllerTag);
        }
    };
});
System.register("file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/KeyBoard", ["file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/deps/ecsy"], function (exports_15, context_15) {
    "use strict";
    var ecsy_ts_8, KeyBoard, schema;
    var __moduleName = context_15 && context_15.id;
    return {
        setters: [
            function (ecsy_ts_8_1) {
                ecsy_ts_8 = ecsy_ts_8_1;
            }
        ],
        execute: function () {
            KeyBoard = class KeyBoard extends ecsy_ts_8.Component {
            };
            schema = {};
            KeyBoard.schema = schema;
            exports_15("default", KeyBoard);
        }
    };
});
System.register("file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/emitters/ControllerEmitter", ["file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/deps/eventEmitter"], function (exports_16, context_16) {
    "use strict";
    var eventEmitter_ts_2, ControllerEmitter;
    var __moduleName = context_16 && context_16.id;
    return {
        setters: [
            function (eventEmitter_ts_2_1) {
                eventEmitter_ts_2 = eventEmitter_ts_2_1;
            }
        ],
        execute: function () {
            ControllerEmitter = class ControllerEmitter extends eventEmitter_ts_2.default {
                emit(controlKey, ...args) {
                    return super.emit(controlKey, args);
                }
                on(controlKey, handler) {
                    return super.on(controlKey, handler);
                }
            };
            exports_16("default", ControllerEmitter);
        }
    };
});
System.register("file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/Owner", ["file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/deps/ecsy"], function (exports_17, context_17) {
    "use strict";
    var ecsy_ts_9, Owner;
    var __moduleName = context_17 && context_17.id;
    return {
        setters: [
            function (ecsy_ts_9_1) {
                ecsy_ts_9 = ecsy_ts_9_1;
            }
        ],
        execute: function () {
            Owner = class Owner extends ecsy_ts_9.Component {
            };
            Owner.schema = {
                value: {
                    type: ecsy_ts_9.Types.String,
                    default: "playerOne"
                }
            };
            exports_17("default", Owner);
        }
    };
});
System.register("file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/IController", [], function (exports_18, context_18) {
    "use strict";
    var __moduleName = context_18 && context_18.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/Paddle", ["file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/deps/ecsy"], function (exports_19, context_19) {
    "use strict";
    var ecsy_ts_10, Paddle;
    var __moduleName = context_19 && context_19.id;
    return {
        setters: [
            function (ecsy_ts_10_1) {
                ecsy_ts_10 = ecsy_ts_10_1;
            }
        ],
        execute: function () {
            Paddle = class Paddle extends ecsy_ts_10.TagComponent {
            };
            exports_19("default", Paddle);
        }
    };
});
System.register("file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/Ball", ["file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/deps/ecsy"], function (exports_20, context_20) {
    "use strict";
    var ecsy_ts_11, Ball;
    var __moduleName = context_20 && context_20.id;
    return {
        setters: [
            function (ecsy_ts_11_1) {
                ecsy_ts_11 = ecsy_ts_11_1;
            }
        ],
        execute: function () {
            Ball = class Ball extends ecsy_ts_11.TagComponent {
            };
            exports_20("default", Ball);
        }
    };
});
System.register("file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/factories/GameEntityFactories", ["file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/Position", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/Velocity", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/Shape", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/Renderable", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/TwoDimensions", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/AxisAlignedBoundingBox", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/ControllerTag", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/KeyBoard", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/emitters/ControllerEmitter", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/Owner", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/Paddle", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/Ball"], function (exports_21, context_21) {
    "use strict";
    var Position_ts_1, Velocity_ts_1, Shape_ts_1, Renderable_ts_1, TwoDimensions_ts_1, AxisAlignedBoundingBox_ts_1, ControllerTag_ts_1, KeyBoard_ts_1, ControllerEmitter_ts_1, Owner_ts_1, Paddle_ts_1, Ball_ts_1, create2D, createMovable, createCollidable, createMovable2D, createCollidableMovable2D, createBoundingBox, movePaddleUp, movePaddleDown, controllerFactory, paddleFactory;
    var __moduleName = context_21 && context_21.id;
    function ballFactory(world, props) {
        const ball = world.createEntity("Ball");
        ball.addComponent(Ball_ts_1.default);
        props.bounds = createBoundingBox(props);
        return createCollidableMovable2D(ball, props);
    }
    exports_21("ballFactory", ballFactory);
    return {
        setters: [
            function (Position_ts_1_1) {
                Position_ts_1 = Position_ts_1_1;
            },
            function (Velocity_ts_1_1) {
                Velocity_ts_1 = Velocity_ts_1_1;
            },
            function (Shape_ts_1_1) {
                Shape_ts_1 = Shape_ts_1_1;
            },
            function (Renderable_ts_1_1) {
                Renderable_ts_1 = Renderable_ts_1_1;
            },
            function (TwoDimensions_ts_1_1) {
                TwoDimensions_ts_1 = TwoDimensions_ts_1_1;
            },
            function (AxisAlignedBoundingBox_ts_1_1) {
                AxisAlignedBoundingBox_ts_1 = AxisAlignedBoundingBox_ts_1_1;
            },
            function (ControllerTag_ts_1_1) {
                ControllerTag_ts_1 = ControllerTag_ts_1_1;
            },
            function (KeyBoard_ts_1_1) {
                KeyBoard_ts_1 = KeyBoard_ts_1_1;
            },
            function (ControllerEmitter_ts_1_1) {
                ControllerEmitter_ts_1 = ControllerEmitter_ts_1_1;
            },
            function (Owner_ts_1_1) {
                Owner_ts_1 = Owner_ts_1_1;
            },
            function (Paddle_ts_1_1) {
                Paddle_ts_1 = Paddle_ts_1_1;
            },
            function (Ball_ts_1_1) {
                Ball_ts_1 = Ball_ts_1_1;
            }
        ],
        execute: function () {
            create2D = (entity, props) => {
                const { position, dimensions, shape } = props;
                return entity
                    .addComponent(Position_ts_1.default, position)
                    .addComponent(TwoDimensions_ts_1.default, dimensions)
                    .addComponent(Shape_ts_1.default, shape)
                    .addComponent(Renderable_ts_1.default);
            };
            createMovable = (entity, props) => {
                const { velocity } = props;
                return entity.addComponent(Velocity_ts_1.default, velocity);
            };
            createCollidable = (entity, props) => {
                props.bounds = createBoundingBox(props);
                return entity.addComponent(AxisAlignedBoundingBox_ts_1.default, props);
            };
            createMovable2D = (entity, props) => createMovable(create2D(entity, props), props);
            createCollidableMovable2D = (entity, props) => createCollidable(createMovable2D(entity, props), props);
            createBoundingBox = (props) => {
                const left = props.position.x;
                const right = props.position.x + props.dimensions.width;
                const top = props.position.y;
                const bottom = props.position.y + props.dimensions.height;
                return {
                    bounds: {
                        left,
                        right,
                        top,
                        bottom
                    }
                };
            };
            movePaddleUp = (entity) => {
                const velocity = entity.getMutableComponent(Velocity_ts_1.default);
                velocity.y = 1;
                console.log(velocity);
            };
            movePaddleDown = (entity) => {
                const velocity = entity.getMutableComponent(Velocity_ts_1.default);
                velocity.y = -1;
                console.log(velocity);
            };
            controllerFactory = (world, props) => {
                const controller = world.createEntity("Controller");
                const { owner } = props;
                controller
                    .addComponent(KeyBoard_ts_1.default)
                    .addComponent(Owner_ts_1.default, owner)
                    .addComponent(ControllerTag_ts_1.default);
                controller.emitter = new ControllerEmitter_ts_1.default();
                controller
                    .emitter
                    .on("w", movePaddleUp)
                    .on("s", movePaddleDown)
                    .on("ArrowUp", movePaddleDown)
                    .on("ArrowDown", movePaddleDown);
                return controller;
            };
            exports_21("controllerFactory", controllerFactory);
            paddleFactory = (world, name, playerTag, props) => {
                const paddle = world.createEntity(name);
                paddle
                    .addComponent(Paddle_ts_1.default)
                    .addComponent(playerTag);
                props.bounds = createBoundingBox(props);
                return createCollidableMovable2D(paddle, props);
            };
            exports_21("paddleFactory", paddleFactory);
        }
    };
});
System.register("file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/PlayerTags", ["file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/deps/ecsy"], function (exports_22, context_22) {
    "use strict";
    var ecsy_ts_12, PlayerOne, PlayerTwo;
    var __moduleName = context_22 && context_22.id;
    return {
        setters: [
            function (ecsy_ts_12_1) {
                ecsy_ts_12 = ecsy_ts_12_1;
            }
        ],
        execute: function () {
            PlayerOne = class PlayerOne extends ecsy_ts_12.TagComponent {
            };
            exports_22("PlayerOne", PlayerOne);
            PlayerTwo = class PlayerTwo extends ecsy_ts_12.TagComponent {
            };
            exports_22("PlayerTwo", PlayerTwo);
        }
    };
});
System.register("file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/mod", ["file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/Position", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/Velocity", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/TwoDimensions", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/Shape", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/Renderable", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/AxisAlignedBoundingBox", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/KeyBoard", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/ControllerTag", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/Owner", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/PlayerTags", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/Paddle", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/Ball"], function (exports_23, context_23) {
    "use strict";
    var Position_ts_2, Velocity_ts_2, TwoDimensions_ts_2, Shape_ts_2, Renderable_ts_2, AxisAlignedBoundingBox_ts_2, KeyBoard_ts_2, ControllerTag_ts_2, Owner_ts_2, PlayerTags_ts_1, Paddle_ts_2, Ball_ts_2;
    var __moduleName = context_23 && context_23.id;
    return {
        setters: [
            function (Position_ts_2_1) {
                Position_ts_2 = Position_ts_2_1;
            },
            function (Velocity_ts_2_1) {
                Velocity_ts_2 = Velocity_ts_2_1;
            },
            function (TwoDimensions_ts_2_1) {
                TwoDimensions_ts_2 = TwoDimensions_ts_2_1;
            },
            function (Shape_ts_2_1) {
                Shape_ts_2 = Shape_ts_2_1;
            },
            function (Renderable_ts_2_1) {
                Renderable_ts_2 = Renderable_ts_2_1;
            },
            function (AxisAlignedBoundingBox_ts_2_1) {
                AxisAlignedBoundingBox_ts_2 = AxisAlignedBoundingBox_ts_2_1;
            },
            function (KeyBoard_ts_2_1) {
                KeyBoard_ts_2 = KeyBoard_ts_2_1;
            },
            function (ControllerTag_ts_2_1) {
                ControllerTag_ts_2 = ControllerTag_ts_2_1;
            },
            function (Owner_ts_2_1) {
                Owner_ts_2 = Owner_ts_2_1;
            },
            function (PlayerTags_ts_1_1) {
                PlayerTags_ts_1 = PlayerTags_ts_1_1;
            },
            function (Paddle_ts_2_1) {
                Paddle_ts_2 = Paddle_ts_2_1;
            },
            function (Ball_ts_2_1) {
                Ball_ts_2 = Ball_ts_2_1;
            }
        ],
        execute: function () {
            exports_23("Position", Position_ts_2.default);
            exports_23("Velocity", Velocity_ts_2.default);
            exports_23("TwoDimensions", TwoDimensions_ts_2.default);
            exports_23("Shape", Shape_ts_2.default);
            exports_23("Renderable", Renderable_ts_2.default);
            exports_23("AxisAlignedBoundingBox", AxisAlignedBoundingBox_ts_2.default);
            exports_23("KeyBoard", KeyBoard_ts_2.default);
            exports_23("ControllerTag", ControllerTag_ts_2.default);
            exports_23("Owner", Owner_ts_2.default);
            exports_23("PlayerOne", PlayerTags_ts_1.PlayerOne);
            exports_23("PlayerTwo", PlayerTags_ts_1.PlayerTwo);
            exports_23("Paddle", Paddle_ts_2.default);
            exports_23("Ball", Ball_ts_2.default);
        }
    };
});
System.register("file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/systems/MovableSystem", ["file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/deps/ecsy", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/Position", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/Velocity"], function (exports_24, context_24) {
    "use strict";
    var ecsy_ts_13, Position_ts_3, Velocity_ts_3, MovableSystem;
    var __moduleName = context_24 && context_24.id;
    return {
        setters: [
            function (ecsy_ts_13_1) {
                ecsy_ts_13 = ecsy_ts_13_1;
            },
            function (Position_ts_3_1) {
                Position_ts_3 = Position_ts_3_1;
            },
            function (Velocity_ts_3_1) {
                Velocity_ts_3 = Velocity_ts_3_1;
            }
        ],
        execute: function () {
            MovableSystem = class MovableSystem extends ecsy_ts_13.System {
                constructor() {
                    super(...arguments);
                    this.update = (delta, speed) => (entity) => {
                        const velocity = entity.getComponent(Velocity_ts_3.default);
                        const position = entity.getMutableComponent(Position_ts_3.default);
                        position.x += velocity.x * speed * delta;
                        position.y += velocity.y * speed * delta;
                    };
                }
                execute(delta, time) {
                    const speed = this.world.options.speed;
                    let movingQuery = this.queries.moving;
                    let updatePosition = this.update(delta, speed);
                    movingQuery.results.forEach(updatePosition);
                }
            };
            exports_24("MovableSystem", MovableSystem);
            MovableSystem.queries = {
                moving: {
                    components: [Position_ts_3.default, Velocity_ts_3.default],
                    listen: {
                        changed: [Position_ts_3.default]
                    }
                }
            };
        }
    };
});
System.register("file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/systems/CollidableSystem", ["file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/deps/ecsy", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/Velocity", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/Position", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/AxisAlignedBoundingBox", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/TwoDimensions", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/Ball", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/Paddle"], function (exports_25, context_25) {
    "use strict";
    var ecsy_ts_14, Velocity_ts_4, Position_ts_4, AxisAlignedBoundingBox_ts_3, TwoDimensions_ts_3, Ball_ts_3, Paddle_ts_3, CollidableSystem;
    var __moduleName = context_25 && context_25.id;
    return {
        setters: [
            function (ecsy_ts_14_1) {
                ecsy_ts_14 = ecsy_ts_14_1;
            },
            function (Velocity_ts_4_1) {
                Velocity_ts_4 = Velocity_ts_4_1;
            },
            function (Position_ts_4_1) {
                Position_ts_4 = Position_ts_4_1;
            },
            function (AxisAlignedBoundingBox_ts_3_1) {
                AxisAlignedBoundingBox_ts_3 = AxisAlignedBoundingBox_ts_3_1;
            },
            function (TwoDimensions_ts_3_1) {
                TwoDimensions_ts_3 = TwoDimensions_ts_3_1;
            },
            function (Ball_ts_3_1) {
                Ball_ts_3 = Ball_ts_3_1;
            },
            function (Paddle_ts_3_1) {
                Paddle_ts_3 = Paddle_ts_3_1;
            }
        ],
        execute: function () {
            CollidableSystem = class CollidableSystem extends ecsy_ts_14.System {
                init() {
                    this.context = this.world.options.context;
                }
                execute(delta, time) {
                    let dynamicQuery = this.queries.dynamic;
                    dynamicQuery.changed.forEach((entity) => {
                        const position = entity.getComponent(Position_ts_4.default);
                        const dimensions = entity.getComponent(TwoDimensions_ts_3.default);
                        const bounds = entity.getMutableComponent(AxisAlignedBoundingBox_ts_3.default);
                        this.updateBounds(position, bounds, dimensions);
                    });
                    this.queries.paddles.results.forEach((entity) => {
                        const bounds = entity.getComponent(AxisAlignedBoundingBox_ts_3.default);
                        const velocity = entity.getMutableComponent(Velocity_ts_4.default);
                        this.paddleWallCollision(velocity, bounds);
                    });
                    const ball = this.queries.ball.results[0];
                    const ballBounds = ball.getComponent(AxisAlignedBoundingBox_ts_3.default);
                    const ballVelocity = ball.getMutableComponent(Velocity_ts_4.default);
                    this.ballWallCollision(ballVelocity, ballBounds);
                }
                updateBounds(position, bounds, dimensions) {
                    bounds.left = position.x;
                    bounds.right = position.x + dimensions.width;
                    bounds.top = position.y;
                    bounds.bottom = position.y + dimensions.height;
                }
                ballWallCollision(velocity, bounds) {
                    if (bounds.left <= 0 || bounds.right >= this.context.canvas.width) {
                        this.world.options.scoreEmitter.emit("score", {
                            playerScored: bounds.left < 0 ? 2 : 1
                        });
                    }
                    if (bounds.top <= 0 || bounds.bottom >= this.context.canvas.height)
                        velocity.y *= -1;
                }
                paddleWallCollision(velocity, bounds) {
                    if (bounds.top <= 0 || bounds.bottom >= this.context.canvas.height)
                        velocity.y = 0;
                }
            };
            exports_25("CollidableSystem", CollidableSystem);
            CollidableSystem.queries = {
                dynamic: {
                    components: [Velocity_ts_4.default, Position_ts_4.default, AxisAlignedBoundingBox_ts_3.default],
                    listen: {
                        changed: [Position_ts_4.default]
                    }
                },
                ball: {
                    components: [Ball_ts_3.default]
                },
                paddles: {
                    components: [Paddle_ts_3.default]
                }
            };
        }
    };
});
System.register("file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/systems/ColliderDebuggingSystem", ["file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/deps/ecsy", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/AxisAlignedBoundingBox"], function (exports_26, context_26) {
    "use strict";
    var ecsy_ts_15, AxisAlignedBoundingBox_ts_4, ColliderDebuggingSystem;
    var __moduleName = context_26 && context_26.id;
    return {
        setters: [
            function (ecsy_ts_15_1) {
                ecsy_ts_15 = ecsy_ts_15_1;
            },
            function (AxisAlignedBoundingBox_ts_4_1) {
                AxisAlignedBoundingBox_ts_4 = AxisAlignedBoundingBox_ts_4_1;
            }
        ],
        execute: function () {
            ColliderDebuggingSystem = class ColliderDebuggingSystem extends ecsy_ts_15.System {
                init() {
                    this.ctx = this.world.options.context;
                }
                execute(delta, time) {
                    this.queries.collider.results.forEach((entity) => {
                        const bounds = entity.getComponent(AxisAlignedBoundingBox_ts_4.default);
                        this.drawDebugRect(this.ctx, bounds);
                    });
                }
                drawDebugRect(ctx, bounds) {
                    const width = bounds.right - bounds.left;
                    const height = bounds.bottom - bounds.top;
                    ctx.save();
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = "#00ff00";
                    ctx.strokeRect(bounds.left, bounds.top, width, height);
                    ctx.restore();
                }
            };
            exports_26("ColliderDebuggingSystem", ColliderDebuggingSystem);
            ColliderDebuggingSystem.queries = {
                collider: {
                    components: [AxisAlignedBoundingBox_ts_4.default]
                }
            };
        }
    };
});
System.register("file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/systems/RenderableSystem", ["file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/deps/ecsy", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/Renderable", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/Shape", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/Position", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/TwoDimensions"], function (exports_27, context_27) {
    "use strict";
    var ecsy_ts_16, Renderable_ts_3, Shape_ts_3, Position_ts_5, TwoDimensions_ts_4, RenderableSystem;
    var __moduleName = context_27 && context_27.id;
    return {
        setters: [
            function (ecsy_ts_16_1) {
                ecsy_ts_16 = ecsy_ts_16_1;
            },
            function (Renderable_ts_3_1) {
                Renderable_ts_3 = Renderable_ts_3_1;
            },
            function (Shape_ts_3_1) {
                Shape_ts_3 = Shape_ts_3_1;
            },
            function (Position_ts_5_1) {
                Position_ts_5 = Position_ts_5_1;
            },
            function (TwoDimensions_ts_4_1) {
                TwoDimensions_ts_4 = TwoDimensions_ts_4_1;
            }
        ],
        execute: function () {
            RenderableSystem = class RenderableSystem extends ecsy_ts_16.System {
                init() {
                    this.context = this.world.options.context;
                }
                execute(delta, time) {
                    this.context.fillStyle = "#000000";
                    this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);
                    this.queries.renderable.results.forEach((entity) => {
                        const shape = entity.getComponent(Shape_ts_3.default);
                        const position = entity.getComponent(Position_ts_5.default);
                        const dimensions = entity.getComponent(TwoDimensions_ts_4.default);
                        if (shape.primitive === "box") {
                            this.drawBox(position, dimensions);
                        }
                    });
                }
                drawBox(position, dimensions) {
                    this.context.beginPath();
                    this.context.rect(position.x, position.y, dimensions.width, dimensions.height);
                    this.context.fillStyle = "#ffffff";
                    this.context.fill();
                }
            };
            exports_27("RenderableSystem", RenderableSystem);
            RenderableSystem.queries = {
                renderable: {
                    components: [Renderable_ts_3.default, Shape_ts_3.default]
                }
            };
        }
    };
});
System.register("file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/systems/InputSystem", ["file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/deps/ecsy", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/KeyBoard", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/ControllerTag", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/PlayerTags", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/Velocity", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/Owner"], function (exports_28, context_28) {
    "use strict";
    var ecsy_ts_17, KeyBoard_ts_3, ControllerTag_ts_3, PlayerTags_ts_2, Velocity_ts_5, Owner_ts_3, InputSystem;
    var __moduleName = context_28 && context_28.id;
    return {
        setters: [
            function (ecsy_ts_17_1) {
                ecsy_ts_17 = ecsy_ts_17_1;
            },
            function (KeyBoard_ts_3_1) {
                KeyBoard_ts_3 = KeyBoard_ts_3_1;
            },
            function (ControllerTag_ts_3_1) {
                ControllerTag_ts_3 = ControllerTag_ts_3_1;
            },
            function (PlayerTags_ts_2_1) {
                PlayerTags_ts_2 = PlayerTags_ts_2_1;
            },
            function (Velocity_ts_5_1) {
                Velocity_ts_5 = Velocity_ts_5_1;
            },
            function (Owner_ts_3_1) {
                Owner_ts_3 = Owner_ts_3_1;
            }
        ],
        execute: function () {
            InputSystem = class InputSystem extends ecsy_ts_17.System {
                execute(delta, time) {
                    const playerOnePaddle = this.queries.playerOnePaddle.results[0];
                    const playerTwoPladdle = this.queries.playerTwoPaddle.results[0];
                    this.queries.controllers.changed.forEach((entity) => {
                        const keyBoard = entity.getComponent(KeyBoard_ts_3.default);
                        const currentKey = keyBoard.currentKey;
                        const owner = entity.getComponent(Owner_ts_3.default);
                        if (owner.value === "playerOne") {
                            if (!currentKey)
                                this.updatePaddleVelocity(0, playerOnePaddle);
                            else if (currentKey === "w")
                                this.updatePaddleVelocity(-1, playerOnePaddle);
                            else if (currentKey === "s")
                                this.updatePaddleVelocity(1, playerOnePaddle);
                        }
                        else if (owner.value === "playerTwo") {
                            if (!currentKey)
                                this.updatePaddleVelocity(0, playerTwoPladdle);
                            else if (currentKey === "ArrowUp")
                                this.updatePaddleVelocity(-1, playerTwoPladdle);
                            else if (currentKey === "ArrowDown")
                                this.updatePaddleVelocity(1, playerTwoPladdle);
                        }
                    });
                }
                updatePaddleVelocity(magnitude, entity) {
                    const velocity = entity.getMutableComponent(Velocity_ts_5.default);
                    velocity.y = magnitude;
                    console.log(velocity);
                }
            };
            exports_28("InputSystem", InputSystem);
            InputSystem.queries = {
                controllers: {
                    components: [KeyBoard_ts_3.default, ControllerTag_ts_3.default],
                    listen: {
                        changed: [KeyBoard_ts_3.default]
                    }
                },
                playerOnePaddle: {
                    components: [PlayerTags_ts_2.PlayerOne]
                },
                playerTwoPaddle: {
                    components: [PlayerTags_ts_2.PlayerTwo]
                }
            };
        }
    };
});
System.register("file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/systems/mod", ["file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/systems/MovableSystem", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/systems/CollidableSystem", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/systems/ColliderDebuggingSystem", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/systems/RenderableSystem", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/systems/InputSystem"], function (exports_29, context_29) {
    "use strict";
    var MovableSystem_ts_1, CollidableSystem_ts_1, ColliderDebuggingSystem_ts_1, RenderableSystem_ts_1, InputSystem_ts_1;
    var __moduleName = context_29 && context_29.id;
    return {
        setters: [
            function (MovableSystem_ts_1_1) {
                MovableSystem_ts_1 = MovableSystem_ts_1_1;
            },
            function (CollidableSystem_ts_1_1) {
                CollidableSystem_ts_1 = CollidableSystem_ts_1_1;
            },
            function (ColliderDebuggingSystem_ts_1_1) {
                ColliderDebuggingSystem_ts_1 = ColliderDebuggingSystem_ts_1_1;
            },
            function (RenderableSystem_ts_1_1) {
                RenderableSystem_ts_1 = RenderableSystem_ts_1_1;
            },
            function (InputSystem_ts_1_1) {
                InputSystem_ts_1 = InputSystem_ts_1_1;
            }
        ],
        execute: function () {
            exports_29("MovableSystem", MovableSystem_ts_1.MovableSystem);
            exports_29("CollidableSystem", CollidableSystem_ts_1.CollidableSystem);
            exports_29("ColliderDebuggingSystem", ColliderDebuggingSystem_ts_1.ColliderDebuggingSystem);
            exports_29("RenderableSystem", RenderableSystem_ts_1.RenderableSystem);
            exports_29("InputSystem", InputSystem_ts_1.InputSystem);
        }
    };
});
System.register("file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/app", ["file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/deps/ecsy", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/emitters/ScoreEmitter", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/ui/ScoreBoard/public/build/bundle", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/factories/GameEntityFactories", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/components/mod", "file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/systems/mod"], function (exports_30, context_30) {
    "use strict";
    var ecsy_ts_18, ScoreEmitter_ts_1, bundle_js_1, GameEntityFactories_ts_1, mod_ts_2, mod_ts_3, scoreEmitter, scoreBoard, canvas, context, center, SPEED_MULTIPLIER, getRandomVelocity, worldFactory, world, ball, paddleHeight, paddleDimensions, paddleOne, paddleTwo, playerOneController, playerTwoController, resetBall, isValidKey, updateKeyBoard, lastTime;
    var __moduleName = context_30 && context_30.id;
    function run() {
        var time = performance.now();
        var delta = time - lastTime;
        world.execute(delta, time);
        lastTime = time;
        requestAnimationFrame(run);
    }
    return {
        setters: [
            function (ecsy_ts_18_1) {
                ecsy_ts_18 = ecsy_ts_18_1;
            },
            function (ScoreEmitter_ts_1_1) {
                ScoreEmitter_ts_1 = ScoreEmitter_ts_1_1;
            },
            function (bundle_js_1_1) {
                bundle_js_1 = bundle_js_1_1;
            },
            function (GameEntityFactories_ts_1_1) {
                GameEntityFactories_ts_1 = GameEntityFactories_ts_1_1;
            },
            function (mod_ts_2_1) {
                mod_ts_2 = mod_ts_2_1;
            },
            function (mod_ts_3_1) {
                mod_ts_3 = mod_ts_3_1;
            }
        ],
        execute: function () {
            scoreEmitter = new ScoreEmitter_ts_1.default();
            scoreBoard = new bundle_js_1.ScoreBoard({
                target: document.getElementById("score-board")
            });
            canvas = document.getElementById("game-area");
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            context = canvas.getContext("2d");
            center = {
                x: canvas.width / 2,
                y: canvas.height / 2
            };
            SPEED_MULTIPLIER = 0.9;
            getRandomVelocity = () => {
                return {
                    x: (Math.random() >= 0.5 ? 1 : -1) * SPEED_MULTIPLIER * 1.5,
                    y: Math.random() * SPEED_MULTIPLIER * 1.5
                };
            };
            worldFactory = (props, components, systems) => {
                const world = new ecsy_ts_18.World(props);
                components.forEach(component => world.registerComponent(component));
                systems.forEach(system => world.registerSystem(system));
                return world;
            };
            world = worldFactory({ context, scoreEmitter, speed: 0.2 }, [
                mod_ts_2.Owner,
                mod_ts_2.KeyBoard,
                mod_ts_2.Velocity,
                mod_ts_2.Position,
                mod_ts_2.TwoDimensions,
                mod_ts_2.Shape,
                mod_ts_2.AxisAlignedBoundingBox,
                mod_ts_2.Renderable,
                mod_ts_2.ControllerTag,
                mod_ts_2.PlayerOne,
                mod_ts_2.PlayerTwo,
                mod_ts_2.Paddle,
                mod_ts_2.Ball
            ], [
                mod_ts_3.InputSystem,
                mod_ts_3.MovableSystem,
                mod_ts_3.CollidableSystem,
                mod_ts_3.RenderableSystem,
                mod_ts_3.ColliderDebuggingSystem
            ]);
            ball = GameEntityFactories_ts_1.ballFactory(world, {
                position: center,
                dimensions: {
                    width: 20,
                    height: 20
                },
                shape: {
                    primitive: "box"
                },
                velocity: getRandomVelocity()
            });
            paddleHeight = canvas.height * 0.30;
            paddleDimensions = {
                width: 20,
                height: paddleHeight
            };
            paddleOne = GameEntityFactories_ts_1.paddleFactory(world, "PaddleOne", mod_ts_2.PlayerOne, {
                position: {
                    x: (center.x - (paddleDimensions.width / 2)) - (canvas.width * 0.47),
                    y: center.y - (paddleDimensions.height / 2)
                },
                dimensions: {
                    width: 20,
                    height: paddleHeight
                },
                shape: {
                    primitive: "box"
                },
                velocity: {
                    x: 0,
                    y: 0
                }
            });
            paddleTwo = GameEntityFactories_ts_1.paddleFactory(world, "PaddleTwo", mod_ts_2.PlayerTwo, {
                position: {
                    x: (center.x - (paddleDimensions.width / 2)) - (1 - ((canvas.width * 0.47))),
                    y: center.y - (paddleDimensions.height / 2)
                },
                dimensions: paddleDimensions,
                shape: {
                    primitive: "box"
                },
                velocity: {
                    x: 0,
                    y: 0
                }
            });
            playerOneController = GameEntityFactories_ts_1.controllerFactory(world, {
                owner: {
                    value: "playerOne"
                }
            });
            playerTwoController = GameEntityFactories_ts_1.controllerFactory(world, {
                owner: {
                    value: "playerTwo"
                }
            });
            resetBall = (ball) => {
                const position = ball.getMutableComponent(mod_ts_2.Position);
                const velocity = ball.getMutableComponent(mod_ts_2.Velocity);
                const randoVelocity = getRandomVelocity();
                position.x = center.x;
                position.y = center.y;
                velocity.x = randoVelocity.x;
                velocity.y = randoVelocity.y;
            };
            scoreEmitter.on("score", (data) => {
                scoreBoard.updateScore(data);
                resetBall(ball);
            });
            isValidKey = (key) => {
                const allowedKeys = ["w", "s", "ArrowUp", "ArrowDown"];
                return allowedKeys.indexOf(key) !== -1;
            };
            updateKeyBoard = (controller, isKeyDown, key) => {
                let keyBoard = controller.getComponent(mod_ts_2.KeyBoard);
                if (keyBoard[key] !== isKeyDown) {
                    keyBoard = controller.getMutableComponent(mod_ts_2.KeyBoard);
                    keyBoard[key] = isKeyDown;
                    keyBoard.currentKey = isKeyDown ? key : undefined;
                }
            };
            document.addEventListener("keydown", (event) => {
                const key = event.key;
                if (key === "w" || key === "s")
                    updateKeyBoard(playerOneController, true, key);
                else if (key === "ArrowUp" || key === "ArrowDown")
                    updateKeyBoard(playerTwoController, true, key);
            });
            document.addEventListener("keyup", (event) => {
                const key = event.key;
                if (key === "w" || key === "s")
                    updateKeyBoard(playerOneController, false, key);
                else if (key === "ArrowUp" || key === "ArrowDown")
                    updateKeyBoard(playerTwoController, false, key);
            });
            lastTime = performance.now();
            run();
        }
    };
});

__instantiate("file:///home/trippyak/Documents/Deno/svelteClientAPITest/pong/app", false);
