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
