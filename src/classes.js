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

/**
 * @class Parameter
 * @see https://lua-api.factorio.com/latest/auxiliary/json-docs-runtime.html#Parameter
 */
class Parameter {

    /**
     * @type {string} The name of the parameter.
     */
    name = null;

    /**
     * @type {number} The order of the member as shown in the HTML.
     */
    order = null;

    /**
     * @type {string} The text description of the parameter.
     */
    description = null;

    /**
     * @type {Type|string} The type of the parameter.
     */
    type = null;

    /**
     * @type {boolean} Whether the type is optional or not.
     */
    optional = null;

    /**
     * Creates a new Parameter instance from the given JSON data.
     * @param {object} json The parsed JSON from the documentation
     */
    constructor(json) {
        this.name = json.name;
        this.order = json.order;
        this.description = json.description;
        this.type = json.type ? new Type(json.type) : null;
        this.optional = json.optional || false;
    }

}

/**
 * @class ParameterGroup
 * @see https://lua-api.factorio.com/latest/auxiliary/json-docs-runtime.html#ParameterGroup
 */
class ParameterGroup {

    /**
     * @type {string} The name of the parameter group.
     */
    name = null;

    /**
     * @type {number} The order of the member as shown in the HTML.
     */
    order = null;

    /**
     * @type {string} The text description of the parameter group.
     */
    description = null;

    /**
     * @type {Array<Parameter>} The parameters that the group adds.
     */
    parameters = null;

    /**
     * Creates a new ParameterGroup instance from the given JSON data.
     * @param {object} json The parsed JSON from the documentation
     */
    constructor(json) {
        this.name = json.name;
        this.order = json.order;
        this.description = json.description;

        if (Array.isArray(json.parameters)) {
            this.parameters = [];
            for (const parameter_json of json.parameters) {
                const parameter = new Parameter(parameter_json);
                this.parameters.push(parameter);
            }
        } else {
            this.parameters = null;
        }
    }

}

/**
 * @class VariadicParameter
 * @see https://lua-api.factorio.com/latest/auxiliary/json-docs-runtime.html#VariadicParameter
 */
class VariadicParameter {

    /**
     * @type {Type} The type of the variadic arguments of the method, if it accepts any.
     */
    type = null;

    /**
     * @type {string} The description of the variadic arguments of the method, if it accepts any.
     */
    description = null;

    /**
     * Creates a new VariadicParameter instance from the given JSON data.
     * @param {object} json The parsed JSON from the documentation
     */
    constructor(json) {
        this.type = json.type ? new Type(json.type) : null;
        this.description = json.description;
    }

}

/**
 * @class MethodFormat
 * @see https://lua-api.factorio.com/latest/auxiliary/json-docs-runtime.html#MethodFormat
 */
class MethodFormat {

    /**
     * @type {boolean} Whether the method takes a single table with named parameters or a sequence of unnamed parameters.
     */
    takes_table = null;

    /**
     * @type {boolean|null} If takes_table is true, whether that whole table is optional or not.
     */
    takes_optional = null;

    /**
     * Creates a new MethodFormat instance from the given JSON data.
     * @param {object} json The parsed JSON from the documentation
     */
    constructor(json) {
        this.takes_table = json.takes_table || false;
        this.takes_optional = json.takes_optional || null;
    }

}

/**
 * @class EventRaised
 * @see https://lua-api.factorio.com/latest/auxiliary/json-docs-runtime.html#EventRaised
 */
class EventRaised {

    /**
     * @type {string} The name of the event being raised.
     */
    name = null;

    /**
     * @type {number} The order of the member as shown in the HTML.
     */
    order = null;

    /**
     * @type {string} The text description of the raised event.
     */
    description = null;

    /**
     * @type {string} The timeframe during which the event is raised. One of "instantly", "current_tick", or "future_tick".
     */
    timeframe = null;

    /**
     * @type {boolean} Whether the event is always raised, or only dependant on a certain condition.
     */
    optional = null;

    /**
     * Creates a new EventRaised instance from the given JSON data.
     * @param {object} json The parsed JSON from the documentation
     */
    constructor(json) {
        this.name = json.name;
        this.order = json.order;
        this.description = json.description;
        this.timeframe = json.timeframe;
        this.optional = json.optional;
    }

}

/**
 * @class Attribute
 * @see https://lua-api.factorio.com/latest/auxiliary/json-docs-runtime.html#Attribute
 */
class Attribute extends BasicMember {

    /**
     * @type {Array<string>|null} The list of game expansions needed to use this attribute. If not present, no restrictions apply. Possible values: "space_age".
     */
    visibility = null;

    /**
     * @type {Array<EventRaised>|null} A list of events that this attribute might raise when written to.
     */
    raises = null;

    /**
     * @type {Array<string>|null} A list of strings specifying the sub-type (of the class) that the attribute applies to.
     */
    subclasses = null;

    /**
     * @type {Type|string|null} The type of the attribute when it's read from. Only present if this attribute can be read from.
     */
    read_type = null;

    /**
     * @type {Type|string|null} The type of the attribute when it's written to. Only present if this attribute can be written to.
     */
    write_type = null;

    /**
     * @type {boolean} Whether the attribute is optional or not.
     */
    optional = null;

    /**
     * Creates a new Attribute instance from the given JSON data.
     * @param {object} json The parsed JSON from the documentation
     */
    constructor(json) {
        super(json);
        this.visibility = json.visibility || null;

        if (Array.isArray(json.raises)) {
            this.raises = [];
            for (const raised_json of json.raises) {
                const raised = new EventRaised(raised_json);
                this.raises.push(raised);
            }
        } else {
            this.raises = null;
        }

        this.subclasses = json.subclasses || null;
        this.read_type = json.read_type ? new Type(json.read_type) : null;
        this.write_type = json.write_type ? new Type(json.write_type) : null;
        this.optional = json.optional || false;
    }

    /**
     * Generates the LuaDoc field string for this attribute.
     * @returns {string} The LuaDoc field string.
     */
    toField() {
        let firstLineDesc = this.description.split('\n')[0];
        let typeStr = "";
        if (this.read_type != null && this.write_type != null) {
            typeStr = this.read_type.toString() + " | " + this.write_type.toString();
        } else if (this.read_type != null) {
            typeStr = this.read_type.toString();
        } else if (this.write_type != null) {
            typeStr = this.write_type.toString();
        } else {
            typeStr = "any";
        }
        return "---@field " + this.name + " " + typeStr + " " + firstLineDesc;
    }

}

/**
 * @class Method
 * @see https://lua-api.factorio.com/latest/auxiliary/json-docs-runtime.html#Method
 */
class Method extends BasicMember {

    /**
     * @type {Array<string>|null} The list of game expansions needed to use this method. If not present, no restrictions apply. Possible values: "space_age".
     */
    visibility = null;

    /**
     * @type {Array<EventRaised>|null} A list of events that this method might raise when called.
     */
    raises = null;

    /**
     * @type {Array<string>|null} A list of strings specifying the sub-type (of the class) that the method applies to.
     */
    subclasses = null;

    /**
     * @type {Array<Parameter>} The parameters of the method. How to interpret them depends on the format member.
     */
    parameters = null;

    /**
     * @type {Array<ParameterGroup>|null} The optional parameters that depend on one of the main parameters. Only applies if takes_table is true.
     */
    variant_parameter_groups = null;

    /**
     * @type {string|null} The text description of the optional parameter groups.
     */
    variant_parameter_description = null;

    /**
     * @type {VariadicParameter|null} The variadic parameter of the method, if it accepts any.
     */
    variadic_parameter = null;

    /**
     * @type {MethodFormat} Details on how the method's arguments are defined.
     */
    format = null;

    /**
     * @type {Array<Parameter>|null} The return values of this method, which can contain zero, one, or multiple values. Note that these have the same structure as parameters, but do not specify a name.
     */
    return_values = null;

    /**
     * Creates a new Method instance from the given JSON data.
     * @param {object} json The parsed JSON from the documentation
     */
    constructor(json) {
        super(json);
        this.visibility = json.visibility || null;

        if (Array.isArray(json.raises)) {
            this.raises = [];
            for (const raised_json of json.raises) {
                const raised = new EventRaised(raised_json);
                this.raises.push(raised);
            }
        } else {
            this.raises = null;
        }

        this.subclasses = json.subclasses || null;

        if (Array.isArray(json.parameters)) {
            this.parameters = [];
            for (const parameter_json of json.parameters) {
                const parameter = new Parameter(parameter_json);
                this.parameters.push(parameter);
            }
        } else {
            this.parameters = null;
        }

        if (Array.isArray(json.variant_parameter_groups)) {
            this.variant_parameter_groups = [];
            for (const group_json of json.variant_parameter_groups) {
                const group = new ParameterGroup(group_json);
                this.variant_parameter_groups.push(group);
            }
        } else {
            this.variant_parameter_groups = null;
        }

        this.variant_parameter_description = json.variant_parameter_description || null;
        this.variadic_parameter = json.variadic_parameter ? new VariadicParameter(json.variadic_parameter) : null;
        this.format = json.format ? new MethodFormat(json.format) : null;

        if (Array.isArray(json.return_values)) {
            this.return_values = [];
            for (const return_json of json.return_values) {
                const return_value = new Parameter(return_json);
                this.return_values.push(return_value);
            }
        } else {
            this.return_values = null;
        }
    }

    /**
     * Generates the LuaDoc field string for this method.
     * @returns {string} The LuaDoc field string.
     */
    toField() {
        let firstLineDesc = this.description.split('\n')[0];
        let params = "";
        if (this.parameters != null) {
            for (let i = 0; i < this.parameters.length; i++) {
                const parameter = this.parameters[i];
                params += parameter.name + ':' + parameter.type.toString().replaceAll("defines.", "");
                if (i < this.parameters.length - 1) {
                    params += ", ";
                }
            }
        }
        return "---@field " + this.name + " fun(" + params + ") " + firstLineDesc;
    }

}

/**
 * @class Class
 * @see https://lua-api.factorio.com/latest/auxiliary/json-docs-runtime.html#Class
 */
class Class extends BasicMember {

    /**
     * @type {Array<string>|null} The list of game expansions needed to use this class. If not present, no restrictions apply. Possible values: "space_age".
     */
    visibility = null;

    /**
     * @type {string|null} The name of the class that this class inherits from.
     */
    parent = null;

    /**
     * @type {boolean} Whether the class is never itself instantiated, only inherited from.
     */
    abstract = null;

    /**
     * @type {Array<Method>} The methods that are part of the class.
     */
    methods = null;

    /**
     * @type {Array<Attribute>} The attributes that are part of the class.
     */
    attributes = null;

    /**
     * @type {Array<Method | Attribute>} A list of operators on the class. They are called call, index, or length and have the format of either a Method or an Attribute.
     */
    operators = null;

    /**
     * Creates a new Class instance from the given JSON data.
     * @param {object} json The parsed JSON from the documentation
     */
    constructor(json) {
        super(json);
        this.visibility = json.visibility || null;
        this.parent = json.parent || null;
        this.abstract = json.abstract || false;

        if (Array.isArray(json.methods)) {
            this.methods = [];
            for (const method_json of json.methods) {
                const method = new Method(method_json);
                this.methods.push(method);
            }
        } else {
            this.methods = null;
        }

        if (Array.isArray(json.attributes)) {
            this.attributes = [];
            for (const attribute_json of json.attributes) {
                const attribute = new Attribute(attribute_json);
                this.attributes.push(attribute);
            }
        } else {
            this.attributes = null;
        }

        if (Array.isArray(json.operators)) {
            this.operators = [];
            for (const operator_json of json.operators) {
                let operator = null;
                if (operator_json.name === "call" || operator_json.name === "index" || operator_json.name === "length") {
                    if (operator_json.parameters || operator_json.return_values) {
                        operator = new Method(operator_json);
                    } else {
                        operator = new Attribute(operator_json);
                    }
                }
                if (operator !== null) {
                    this.operators.push(operator);
                }
            }
        } else {
            this.operators = null;
        }
    }

    /**
     * Generates the LuaDoc class string for this class.
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
    Class,
    Prototype
};