const REQUIRED_MESSAGE_TEMPLATE = '$1不能为空'

export function requiredMessage(field: string, template = REQUIRED_MESSAGE_TEMPLATE) {
  return template.replace('$1', field)
}
