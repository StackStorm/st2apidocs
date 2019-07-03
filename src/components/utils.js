import _ from 'lodash';

export function makeEntityLink({ service, version, entity }) {
  let path = [ '' ];

  if (entity) {
    path = [ entity ].concat(path);
  }

  return `/${service}/${version}/${path.join('/')}`;
}

export function makeAnchor(props) {
  const [ , instanceMethod ] = props.model.operationId.split(':');
  return `/${instanceMethod}`;
}

function customizer(objValue, srcValue) {
  if (_.isArray(objValue)) {
    return [ ...new Set(objValue.concat(srcValue)) ];
  }
  return undefined;
}

export function compileSchema(scheme) {
  const result = Object.assign({}, scheme);

  if (result.allOf) {
    const allOf = result.allOf;
    delete result.allOf;
    _.mergeWith(result, ...allOf, customizer);
  }

  return result;
}

export function traverseSchema(model, prefix = []) {
  const { items = {} } = model;
  const { properties = items.properties || {}, required = items.required || [] } = model;

  return _.flatMap(properties, (m, name) => {
    // eslint-disable-next-line no-bitwise
    const extendedModel = _.assign({}, m, { name, required: !!~required.indexOf(name) });
    const key = prefix.concat(name);

    if (m.type === 'object') {
      return [{
        key: key.join('.'),
        level: key.length,
        model: extendedModel,
      }].concat(traverseSchema(m, key));
    }

    if (m.type === 'array') {
      return [{
        key: key.join('.'),
        level: key.length,
        model: extendedModel,
      }].concat(traverseSchema(m, key));
    }

    return {
      key: key.join('.'),
      level: key.length,
      model: extendedModel,
    };
  });
}
