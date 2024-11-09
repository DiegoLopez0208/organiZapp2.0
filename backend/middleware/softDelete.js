const addSoftDelete = async (params, next) => {
  if (params.action === 'delete') {
    params.action = 'update'
    params.args.data = { deletedAt: new Date() }
  }
  return next(params)
}

export default addSoftDelete
