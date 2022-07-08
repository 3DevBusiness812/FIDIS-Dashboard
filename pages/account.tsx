import { useState, useEffect, useMemo, ChangeEvent } from 'react'
import React from 'react'
import AccountSettingsNavBar from '../components/main/account/AccountSettingsNavBar'
import PersonalAccountSettings from '../components/main/account/PersonalAccountSettings'
import BusinessAccountSettings from '../components/main/account/BusinessAccountSettings'
import Button from '../components/core/Button'
import Moralis from 'moralis'
import { useMoralis } from 'react-moralis'
import Notification from '../components/constants/Notification'
import save_updates_icon from '../assets/images/general_icons/Save.png'
import { PersonalAccount, BusinessAccount, AccountType } from '../interfaces'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { personaVerify } from '../utils/personaEmbed'
import { Md5 } from 'md5-typescript'

const styles = {
  gray_input:
    'rounded bg-input-background py-3 px-3 text-xs placeholder:text-gray-400',
  gray_input_label: 'text-orange-FIDIS font-semibold block mb-2',
}

const initialPersonalAccount: PersonalAccount = {
  firstName: '',
  lastName: '',
  personalEmail: '',
  birthdayYear: 2022,
  birthdayMonth: 1,
  birthdayDay: 1,
  nationality: 'American',
  idType: 'Passport',
  idNumber: '',
  idPhoto: '',
  houseNo: '',
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'US',
}
const initialBusinessAccount: BusinessAccount = {
  ...initialPersonalAccount,
  companyName: '',
  ein: '',
  companyEmail: '',
  companyHouseNo: '',
  companyStreet: '',
  companyCity: '',
  companyState: '',
  companyZipCode: '',
  companyCountry: '',
}

const User = ({ profilePicture, setProfilePicture }: any) => {
 
  const {
    user,
    account,
    isAuthenticated,
    isAuthUndefined,
    setUserData,
    isUserUpdating,
    userError,
  } = useMoralis()

  //// define the account type Personal/Business
  const [accountType, setAccountType] = useState(AccountType.Personal)
  const [emptyFields, setEmptyFields] = useState(false)
  const [personalAccount, setPersonalAccount] = useState<PersonalAccount>(
    initialPersonalAccount
  )
  const [businessAccount, setBusinessAccount] = useState<BusinessAccount>(
    initialBusinessAccount
  )

  const router = useRouter()

  const isConnected = useMemo(
    () => account && isAuthenticated,
    [account, isAuthenticated]
  )
  // show notification when the user clicks 'Save Info'
  const [
    showNotificationAfterUpdatingUserInfo,
    setShowNotificationAfterUpdatingUserInfo,
  ] = useState(false)

  useEffect(() => {
    user && setAccountType(user.attributes.accountType || AccountType.Personal)

    setTimeout(() => {
      if (isAuthUndefined || !isAuthenticated || !isConnected) {
        router.push('/')
      }
      // else router.back()
    }, 1000)
  }, [])

  useEffect(() => {
    if (!user) return

    if (accountType === AccountType.Business) {
      const entries = Object.keys(businessAccount).map((key) => ({
        [key]: user.get(key),
      }))

      let acc = initialBusinessAccount
      for (const entry of entries) {
        acc = {
          ...acc,
          ...entry,
        }
      }

      setBusinessAccount(acc)
    } else {
      const entries = Object.keys(personalAccount).map((key) => ({
        [key]: user.get(key),
      }))

      let acc = initialPersonalAccount
      for (const entry of entries) {
        acc = {
          ...acc,
          ...entry,
        }
      }

      setPersonalAccount(acc)
    }
  }, [user, isConnected, accountType])

  const writeDataToMoralis = async (accHash: string, type: boolean) => {
    if (!type) {
      await setUserData({ personaVerified: false })

      setShowNotificationAfterUpdatingUserInfo(true)
      setTimeout(() => {
        setShowNotificationAfterUpdatingUserInfo(false)
      }, 8000)

      return
    }

    let birthday = ''
    let homeAddress = ''

    const accountInfo =
      accountType === AccountType.Business ? businessAccount : personalAccount

    const entries = Object.keys(accountInfo).map((key) => ({
      [key]: accountInfo[key],
    }))

    let acc = { personaVerified: true, fidisAccInfoHash: accHash, accountType }
    for (const entry of entries) {
      acc = {
        ...acc,
        ...entry,
      }
    }

    if (accountType === AccountType.Business) {
      birthday = `${personalAccount.birthdayMonth} ${personalAccount.birthdayDay}, ${personalAccount.birthdayYear}`

      homeAddress = `House No: ${personalAccount.houseNo}, Street: ${personalAccount.street}, City: ${personalAccount.city}, , State: ${personalAccount.state}, Zip code: ${personalAccount.zipCode}, Country: ${personalAccount.country}`

      const companyAddress =
        accountType === AccountType.Business
          ? `House No: ${businessAccount.companyHouseNo}, Street: ${businessAccount.companyStreet}, City: ${businessAccount.companyCity}, , State: ${businessAccount.companyState}, Zip code: ${businessAccount.companyZipCode}, Country: ${businessAccount.companyCountry}`
          : ''

      acc = {
        ...acc,
        ...{ companyAddress: companyAddress },
      }
    } else {
      birthday = `${personalAccount.birthdayMonth} ${personalAccount.birthdayDay}, ${personalAccount.birthdayYear}`

      homeAddress = `House No: ${personalAccount.houseNo}, Street: ${personalAccount.street}, City: ${personalAccount.city}, , State: ${personalAccount.state}, Zip code: ${personalAccount.zipCode}, Country: ${personalAccount.country}`
    }

    acc = {
      ...acc,
      ...{ birthday: birthday },
      ...{ homeAddress: homeAddress },
    }

    await setUserData(acc)

    setShowNotificationAfterUpdatingUserInfo(true)
    setTimeout(() => {
      setShowNotificationAfterUpdatingUserInfo(false)
    }, 8000)
  }

  const onPersonaErrorCallback = (accHash: string, status: any, code: any) => {
    console.log('persona error', status, code)
    // display msg
    writeDataToMoralis(accHash, false)
  }

  const onPersonaCancelCallback = (
    accHash: string,
    inquiryId,
    sessionToken
  ) => {
    console.log('persona canceled', inquiryId, sessionToken)
    // display msg
    writeDataToMoralis(accHash, false)
  }

  const onPersonaCompleteCallback = (accHash: string, status: any) => {
    // if successfuly verified, open Buy/Sell dialog
    console.log('persona result', status)
    if (status === 'completed') {
      // write verification result and account info to Moralis database
      writeDataToMoralis(accHash, true)
    }
  }

  // the function to update the user info
  const handleUpdateUserInfo = async (e: any) => {
    e.preventDefault()

    let companyAddress = ''
    let birthday = ''
    let homeAddress = ''

    let templateId = process.env.NEXT_PUBLIC_PERSONA_KYC_TEMPLATE_ID
    let updatedHashValue = ''

    // compare hash values
    if (accountType === AccountType.Personal) {
      birthday = `${personalAccount.birthdayMonth} ${personalAccount.birthdayDay}, ${personalAccount.birthdayYear}`

      homeAddress = `House No: ${personalAccount.houseNo}, Street: ${personalAccount.street}, City: ${personalAccount.city}, , State: ${personalAccount.state}, Zip code: ${personalAccount.zipCode}, Country: ${personalAccount.country}`

      updatedHashValue = Md5.init(
        user.attributes.ethAddress +
          personalAccount.firstName +
          personalAccount.lastName +
          personalAccount.personalEmail +
          birthday +
          personalAccount.nationality +
          personalAccount.idType +
          personalAccount.idNumber
      )
    } else {
      companyAddress = `House No: ${businessAccount.companyHouseNo}, Street: ${businessAccount.companyStreet}, City: ${businessAccount.companyCity}, , State: ${businessAccount.companyState}, Zip code: ${businessAccount.companyZipCode}, Country: ${businessAccount.companyCountry}`

      birthday = `${businessAccount.birthdayMonth} ${businessAccount.birthdayDay}, ${businessAccount.birthdayYear}`

      homeAddress = `House No: ${businessAccount.houseNo}, Street: ${businessAccount.street}, City: ${businessAccount.city}, , State: ${businessAccount.state}, Zip code: ${businessAccount.zipCode}, Country: ${businessAccount.country}`

      templateId = process.env.NEXT_PUBLIC_PERSONA_KYB_TEMPLATE_ID

      updatedHashValue = Md5.init(
        user.attributes.ethAddress +
          businessAccount.firstName +
          businessAccount.lastName +
          businessAccount.personalEmail +
          birthday +
          businessAccount.nationality +
          businessAccount.idType +
          businessAccount.idNumber +
          businessAccount.companyName +
          businessAccount.ein +
          businessAccount.companyEmail
      )
    }

    const moralisData = await user.fetch()
    const verifiedHashValue = moralisData.get('fidisAccInfoHash')
    let kycVerify = false
    if (
      verifiedHashValue === '' ||
      updatedHashValue === '' ||
      verifiedHashValue !== updatedHashValue
    )
      kycVerify = true

    let fieldValues = {
      nameFirst: '',
      nameLast: '',
      birthdate: '',
      addressStreet1: '',
      addressCity: '',
      addressSubdivision: '',
      addressPostalCode: '',
      addressCountryCode: '',
      emailAddress: '',
    }
   
    let isValid = true
    // if accountType is AccountType.Business then send the company info
    if (accountType === AccountType.Business) {
      if (
        !businessAccount.firstName ||
        !businessAccount.lastName ||
        !businessAccount.personalEmail ||
        !businessAccount.birthdayMonth ||
        !businessAccount.birthdayDay ||
        !businessAccount.birthdayYear ||
        !birthday ||
        !businessAccount.nationality ||
        !businessAccount.idType ||
        !businessAccount.idNumber ||
        !businessAccount.companyName ||
        !businessAccount.ein ||
        !businessAccount.companyEmail ||
        !businessAccount.companyHouseNo ||
        !businessAccount.companyStreet ||
        !businessAccount.companyCity ||
        !businessAccount.companyState ||
        !businessAccount.companyZipCode ||
        !businessAccount.companyCountry
      ) {
        isValid = false
      } else {
        fieldValues = {
          nameFirst: businessAccount.firstName,
          nameLast: businessAccount.lastName,
          birthdate: birthday,
          addressStreet1: businessAccount.street,
          addressCity: businessAccount.city,
          addressSubdivision: businessAccount.state,
          addressPostalCode: businessAccount.zipCode,
          addressCountryCode: businessAccount.country,
          emailAddress: businessAccount.personalEmail,
        }
      }
    } else {
      if (
        !personalAccount.firstName ||
        !personalAccount.lastName ||
        !personalAccount.personalEmail ||
        !personalAccount.birthdayMonth ||
        !personalAccount.birthdayDay ||
        !personalAccount.birthdayYear ||
        !birthday ||
        !personalAccount.nationality ||
        !personalAccount.idType ||
        !personalAccount.idNumber
      ) {
        isValid = false
      } else {
        fieldValues = {
          nameFirst: personalAccount.firstName,
          nameLast: personalAccount.lastName,
          birthdate: birthday,
          addressStreet1: personalAccount.street,
          addressCity: personalAccount.city,
          addressSubdivision: personalAccount.state,
          addressPostalCode: personalAccount.zipCode,
          addressCountryCode: personalAccount.country,
          emailAddress: personalAccount.personalEmail,
        }
      }
    }

    if (isValid) {
      if (kycVerify) {
        if (!templateId) {
          console.log('persona templateId is empty')
          return
        }

        personaVerify(
          templateId,
          updatedHashValue,
          fieldValues,
          onPersonaCompleteCallback,
          onPersonaErrorCallback,
          onPersonaCancelCallback
        )
      } else {
        console.log('persona - verified')
        await setUserData({ personaVerified: true })
      }
    } else {
      setEmptyFields(true)
      setTimeout(() => {
        setEmptyFields(false)
      }, 8000)
    }
  }

  const updateValue = (key: string, value: string | number | Date) => {
    if (accountType === AccountType.Personal) {
      setPersonalAccount({
        ...personalAccount,
        [key]: value,
      })
    } else {
      setBusinessAccount({
        ...businessAccount,
        [key]: value,
      })
    }
  }

  const handleSelectChange = (evt: ChangeEvent<HTMLSelectElement>) => {
    const { name: inputName, value } = evt.currentTarget
    updateValue(inputName, value)
  }

  const handleInputChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const { name: inputName, value } = evt.currentTarget
    updateValue(inputName, value)
  }

  return (
    <>
      <Head>
        <title>FIDIS - Account settings</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      {user ? (
        <main className="container mx-auto h-full py-4 text-white">
          <AccountSettingsNavBar
            profilePicture={profilePicture}
            setProfilePicture={setProfilePicture}
            accountType={accountType}
            setAccountType={setAccountType}
            styles={styles}
          />
          <form className="h-[90%] overflow-y-auto">
            <section className="scrolltype flex max-h-[70%] flex-col gap-8 overflow-y-auto pr-8">
              {/* I removed the: relative -top-5 because it was causing the form to appear on the top of the button 'upload photo profile' */}
              <div className="flex">
                <div id="walletAddress">
                  <label
                    htmlFor="walletAddress"
                    className={styles.gray_input_label}
                  >
                    Wallet Address
                  </label>
                  <input
                    type="text"
                    name="walletAddress"
                    id="walletAddress"
                    className={styles.gray_input + ' w-[320px] rounded-md p-4'}
                    placeholder={user.attributes.ethAddress}
                    disabled
                  />
                </div>
              </div>
              {accountType == AccountType.Personal ? (
                <PersonalAccountSettings
                  styles={styles}
                  accountInfo={personalAccount}
                  handleInputChange={handleInputChange}
                  handleSelectChange={handleSelectChange}
                />
              ) : (
                <BusinessAccountSettings
                  styles={styles}
                  accountInfo={businessAccount}
                  handleInputChange={handleInputChange}
                  handleSelectChange={handleSelectChange}
                />
              )}
            </section>

            <div id="save_changes" className="mt-6 flex w-full justify-between">
              <Button
                isLoading={isUserUpdating}
                onClick={handleUpdateUserInfo}
                background="orange-FIDIS"
                svg={save_updates_icon}
                text="Save Changes"
              />
              {emptyFields && <Notification text="Empty fields" color="red" />}
              {userError
                ? showNotificationAfterUpdatingUserInfo && (
                    <Notification text={userError.message} color="red" />
                  )
                : showNotificationAfterUpdatingUserInfo && (
                    <Notification text="Done" color="green" />
                  )}
            </div>
          </form>
        </main>
      ) : (
        <></>
      )}
    </>
  )
}
export default User
