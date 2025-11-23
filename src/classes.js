// https://lua-api.factorio.com/latest/auxiliary/json-docs-prototype.html

/**
 * @class Image
 * @see https://lua-api.factorio.com/latest/auxiliary/json-docs-prototype.html#Image
 */
class Image {

    /**
     * @type {string} The name of the image file to display. These files are placed into the /static/images/ directory.
     */
    filename = null;

    /**
     * @type {string|null} The explanatory text to show attached to the image.
     */
    caption = null;

    /**
     * Creates a new Image instance from the given JSON data.
     * @param {*} json The parsed JSON from the documentation
     */
    constructor(json) {
        this.filename = json.filename;
        this.caption = json.caption || null;
    }

}

/**
 * @class Type
 * @see https://lua-api.factorio.com/latest/auxiliary/json-docs-prototype.html#Type
 */
class Type {

    /**
     * @type {string} A string denoting the kind of complex type.
     */
    complex_type = null;

    /**
     * Only set if complex_type is "dictionary".
     * @type {Type|string|null} The type of the keys of the dictionary.
     */
    key = null;

    /**
     * Only set if complex_type is "array", "dictionary", "literal", or "type."
     * @type {Type|string|number|boolean|null} The type of the elements of the array, or the value of the literal.
     */
    value = null;

    /**
     * Only set if complex_type is "tuple".
     * @type {Array<Type|string>|null} The types of the members of this tuple in order.
     */
    values = null;

    /**
     * Only set if complex_type is "union".
     * @type {Array<Type|string>|null} A list of all compatible types for this type.
     */
    options = null;

    /**
     * Only set if complex_type is "union".
     * @type {boolean|null} Whether the options of this union have a description or not.
     */
    full_format = null;

    /**
     * @type {string|null} The text description of the type.
     */
    description = null;

    /**
     * Creates a new Type instance from the given JSON data.
     * @param {object|string} json The parsed JSON from the documentation
     */
    constructor(json) {
        if (typeof json === 'string') {
            // Simple type represented as a string
            this.complex_type = json;
            return;
        }

        this.complex_type = json.complex_type;
        this.key = json.key ? new Type(json.key) : null;
        if (json.value !== undefined) {
            if (typeof json.value === 'object' && json.value !== null) {
                this.value = new Type(json.value);
            } else {
                this.value = json.value;
            }
        } else {
            this.value = null;
        }

        if (Array.isArray(json.values)) {
            this.values = [];
            for (const value_json of json.values) {
                if (typeof value_json === 'object' && value_json !== null) {
                    this.values.push(new Type(value_json));
                } else {
                    this.values.push(value_json);
                }
            }
        } else {
            this.values = null;
        }

        if (Array.isArray(json.options)) {
            this.options = [];
            for (const option_json of json.options) {
                if (typeof option_json === 'object' && option_json !== null) {
                    this.options.push(new Type(option_json));
                } else {
                    this.options.push(option_json);
                }
            }
        } else {
            this.options = null;
        }

        this.full_format = json.full_format || null;
        this.description = json.description || null;
    }

    /**
     * Generates a string representation of this Type.
     * @returns {string} The string representation of the Type.
     */
    toString() {
        if (this.complex_type == "array") {
            return this.value + "[]";
        } else if (this.complex_type == "dictionary") {
            return "table<" + this.key + ", " + this.value + ">";
        } else if (this.complex_type == "tuple") {
            return "tuple<" + this.values.map(v => v.toString()).join(", ") + ">";
        } else if (this.complex_type == "union") {
            return this.options.map(o => o.toString()).join(" | ");
        } else if (this.complex_type == "literal") {
            if (typeof this.value === "string") {
                // early double quotes for VSCode workaround
                if (this.description) {
                    return `string """${this.description}"`;
                } else {
                    return `string """${this.value}"`;
                }
            } else if (typeof this.value === "number" || typeof this.value === "boolean") {
                if (this.description) {
                    return `${typeof this.value} ${this.description}`;
                } else {
                    return typeof this.value;
                }
            } else {
                return "any";
            }
        } else if (this.complex_type == "type") {
            return this.value.toString();
        } else {
            return this.complex_type;
        }
    }

}

/**
 * @class BasicMember
 * @see https://lua-api.factorio.com/latest/auxiliary/json-docs-prototype.html#BasicMember
 */
class BasicMember {

    /**
     * @type {string} The name of the member.
     */
    name = null;

    /**
     * @type {number} The order of the member as shown in the HTML.
     */
    order = null;

    /**
     * @type {string} The text description of the member. Can be '', but never null.
     */
    description = null;

    /**
     * @type {Array<string>|null} A list of Markdown lists to provide additional information. Usually contained in a spoiler tag.
     */
    lists = null;

    /**
     * @type {Array<string>|null} A list of code-only examples about the member.
     */
    examples = null;

    /**
     * @type {Array<Image>|null} A list of illustrative images shown next to the member.
     */
    images = null;

    /**
     * Creates a new BasicMember instance from the given JSON data.
     * @param {*} json The parsed JSON from the documentation
     */
    constructor(json) {
        this.name = json.name;
        this.order = json.order;
        this.description = json.description || '';
        this.lists = json.lists || null;
        this.examples = json.examples || null;

        if (Array.isArray(json.images)) {
            this.images = [];
            for (const image_json of json.images) {
                const image = new Image(image_json);
                this.images.push(image);
            }
        } else {
            this.images = null;
        }
    }

}

/**
 * @class Concept
 * @see https://lua-api.factorio.com/latest/auxiliary/json-docs-prototype.html#Concept
 */
class Concept extends BasicMember {

    /**
     * @type {string|null} The name of the type's parent, if any.
     */
    parent = null;

    /**
     * @type {boolean} Whether the type is abstract, and thus can't be created directly.
     */
    abstract = null;

    /**
     * @type {boolean} Whether the type is inlined inside another property's description.
     */
    inline = null;

    /**
     * @type {Type|string} The type of the type/concept (Yes, this naming is confusing). Either a proper Type, or the string "builtin", indicating a fundamental type like string or number.
     */
    type = null;

    /**
     * @type {Array<Property>|null} The list of properties that the type has, if its type includes a struct. null otherwise.
     */
    properties = null;

    /**
     * Creates a new Concept instance from the given JSON data.
     * @param {object} json The parsed JSON from the documentation
     */
    constructor(json) {
        super(json);
        this.parent = json.parent || null;
        this.abstract = json.abstract || false;
        this.inline = json.inline || false;
        this.type = json.type ? new Type(json.type) : null;

        if (Array.isArray(json.properties)) {
            this.properties = [];
            for (const property_json of json.properties) {
                const property = new Property(property_json);
                this.properties.push(property);
            }
        } else {
            this.properties = null;
        }
    }

    /**
     * Generates the LuaDoc class string for this concept.
     * @returns {string} The LuaDoc class string.
     */
    toClass() {
        return "---@class " + this.name;
    }

}

/**
 * @class DefineValue
 * @see https://lua-api.factorio.com/latest/auxiliary/json-docs-prototype.html#DefineValue
 */
class DefineValue {

    /**
     * @type {string} The name of the define value.
     */
    name = null;

    /**
     * @type {number} The order of the member as shown in the HTML.
     */
    order = null;

    /**
     * @type {string} The text description of the define value.
     */
    description = null;

    /**
     * Creates a new DefineValue instance from the given JSON data.
     * @param {object} json The parsed JSON from the documentation
     */
    constructor(json) {
        this.name = json.name;
        this.order = json.order;
        this.description = json.description;
    }

    /**
     * Generates the LuaDoc param string for this define value.
     * @returns {string} The LuaDoc param string.
     */
    toField() {
        let firstLineDesc = this.description.split('\n')[0];
        return "---@field " + this.name + " \"" + this.name + '"' + firstLineDesc;
    }

}

/**
 * Defines can be recursive in nature, meaning one Define can have multiple sub-Defines that have the same structure.
 * These are singled out as subkeys instead of values.
 *
 * @class Define
 * @see https://lua-api.factorio.com/latest/auxiliary/json-docs-prototype.html#Define
 */
class Define extends BasicMember {

    /**
     * @type {Array<DefineValue>|null} The members of the define.
     */
    values = null;

    /**
     * @type {Array<Define>|null} A list of sub-defines.
     */
    subkeys = null;

    /**
     * Creates a new Define instance from the given JSON data.
     * @param {object} json The parsed JSON from the documentation
     */
    constructor(json) {
        super(json);

        if (Array.isArray(json.values)) {
            this.values = [];
            for (const value_json of json.values) {
                const value = new DefineValue(value_json);
                this.values.push(value);
            }
        } else {
            this.values = null;
        }

        if (Array.isArray(json.subkeys)) {
            this.subkeys = [];
            for (const subkey_json of json.subkeys) {
                const subkey = new Define(subkey_json);
                this.subkeys.push(subkey);
            }
        } else {
            this.subkeys = null;
        }
    }

    /**
     * Generates the LuaDoc class string for this define.
     * @returns {string} The LuaDoc class string.
     */
    toString() {
        return "---@class " + this.name;
    }

}

/**
 * @class Property
 * @see https://lua-api.factorio.com/latest/auxiliary/json-docs-prototype.html#Property
 */
class Property extends BasicMember {

    /**
     * @type {Array<string>|null} The list of game expansions needed to use this property. If not present, no restrictions apply. Possible values: "space_age".
     */
    visibility = null;

    /**
     * @type {string|null} An alternative name for the property. Either this or name can be used to refer to the property.
     */
    alt_name = null;

    /**
     * @type {boolean} Whether the property overrides a property of the same name in one of its parents.
     */
    override = null;

    /**
     * @type {Type} The type of the property.
     */
    type = null;

    /**
     * @type {boolean} Whether the property is optional and can be omitted. If so, it falls back to a default value.
     */
    optional = null;

    /**
     * Not fully documented. Subtype of Literal.
     * @type {any} The default value of the property. Either a textual description or a literal value.
     */
    default = null;

    /**
     * Creates a new Property instance from the given JSON data.
     * @param {object} json The parsed JSON from the documentation
     */
    constructor(json) {
        super(json);
        this.visibility = json.visibility || null;
        this.alt_name = json.alt_name || null;
        this.override = json.override || false;
        this.type = json.type ? new Type(json.type) : null;
        this.optional = json.optional || false;
        this.default = json.default || null;
    }

    /**
     * Generates the LuaDoc field string for this property.
     * @returns {string} The LuaDoc field string.
     */
    toField() {
        let firstLineDesc = this.description.split('\n')[0];
        return "---@field " + this.name + " " + this.type + " " + firstLineDesc;
    }

}

/**
 * @class Prototype
 * @description Represents a Factorio prototype as defined in the JSON documentation.
 * @see https://lua-api.factorio.com/latest/auxiliary/json-docs-prototype.html#Prototype
 */
class Prototype extends BasicMember {

    /**
     * @type {Array<string>|null} The list of game expansions needed to use this prototype. If not present, no restrictions apply. Possible values: "space_age".
     */
    visibility = null;

    /**
     * @type {string|null} The name of the prototype's parent, if any.
     */
    parent = null;

    /**
     * @type {boolean} Whether the prototype is abstract, and thus can't be created directly.
     */
    abstract = null;

    /**
     * @type {string|null} The type name of the prototype, like "boiler". null for abstract prototypes.
     */
    typename = null;

    /**
     * @type {number|null} The maximum number of instances of this prototype that can be created, if any.
     */
    instance_limit = null;

    /**
     * @type {boolean} Whether the prototype is deprecated and shouldn't be used anymore.
     */
    deprecated = null;

    /**
     * @type {Array<Property>} The list of properties that the prototype has. May be an empty array.
     */
    properties = null;

    /**
     * TODO: document
     */
    custom_properties = null;

    /**
     * Creates a new Prototype instance from the given JSON data.
     * @param {object} json The parsed JSON from the documentation
     */
    constructor(json) {
        super(json);
        this.visibility = json.visibility || null;
        this.parent = json.parent || null;
        this.abstract = json.abstract || false;
        this.typename = json.typename || null;
        this.instance_limit = json.instance_limit || null;
        this.deprecated = json.deprecated || false;
        this.custom_properties = json.custom_properties || null;
        this.default = json.default || null;

        if (Array.isArray(json.properties)) {
            this.properties = [];
            for (const property_json of json.properties) {
                const property = new Property(property_json);
                this.properties.push(property);
            }
        }
    }

    /**
     * Generates the LuaDoc class string for this prototype.
     * @returns {string} The LuaDoc class string.
     */
    toClass() {
        return "---@class " + this.name;
    }

}

module.exports = {
    Image,
    BasicMember,
    Concept,
    Define,
    Property,
    Prototype
};