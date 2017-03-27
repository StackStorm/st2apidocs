import _ from 'lodash';

export function makeEntityLink({ service, version, entity }) {
  let path = [''];

  if (entity) {
    path = [entity].concat(path);
  }

  return `/${service}/${version}/${path.join('/')}`;
}

export function makeAnchor(props) {
  const [, instanceMethod] = props.model.operationId.split(':');
  return `/${instanceMethod}`;
}

function customizer(objValue, srcValue) {
  if (_.isArray(objValue)) {
    return [...new Set(objValue.concat(srcValue))];
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
