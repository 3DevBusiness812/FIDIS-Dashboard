declare var Persona

export const personaVerify = (
  id,
  hash,
  fieldValues,
  onCompleteCallback,
  onErrorCallback,
  onCancelCallback
) => {
  const client = new Persona.Client({
    templateId: id,
    environment: 'sandbox',
    onReady: () => client.open(),
    onComplete: ({ inquiryId, status, fields }) => {
      console.log(`Completed inquiry ${inquiryId} with status ${status}`)
      onCompleteCallback(hash, status)
    },
    onCancel: ({ inquiryId, sessionToken }) => {
      console.log(
        `Canceled inquiry ${inquiryId} with sessionToken ${sessionToken}`
      )
      onCancelCallback(hash, inquiryId, sessionToken)
    },
    onError: ({ status, code }) => {
      console.log(`Error inquiry ${status} with code ${code}`)
      onErrorCallback(hash, status, code)
    },
    fields: fieldValues,
  })
}
