import { useEffect, useState, ChangeEvent } from 'react'
import NationalityList from '../../constants/NationalityList'
import { useMoralis } from 'react-moralis'
import { PersonalAccount, BusinessAccount } from '../../../interfaces'
import PersonalAccountSettings from './PersonalAccountSettings'

const initialPersonalAccount: PersonalAccount = {
  firstName: '',
  lastName: '',
  personalEmail: '',
  birthdayYear: 2022,
  birthdayMonth: 1,
  birthdayDay: 1,
  nationality: '',
  idType: '',
  idNumber: '',
  idPhoto: '',
  houseNo: '',
  street: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
}

const BusinessAccountSettings = ({
  styles,
  accountInfo,
  handleInputChange,
  handleSelectChange,
}: {
  styles: { gray_input_label: string; gray_input: string }
  accountInfo: BusinessAccount
  handleInputChange: (evt: ChangeEvent<HTMLInputElement>) => void
  handleSelectChange: (evt: ChangeEvent<HTMLSelectElement>) => void
}) => {
  const [personalInfo, setPersonalInfo] = useState<PersonalAccount>(
    initialPersonalAccount
  )

  const { user } = useMoralis()

  if (!user) return <div>user logged out</div>

  const companyInfo = [
    {
      id: 'companyName',
      text: 'Company Name',
      placeholder: 'FIDIS Corp',
      value: accountInfo.companyName,
    },
    {
      id: 'ein',
      text: 'EIN',
      placeholder: '7459340573',
      value: accountInfo.ein,
    },
    {
      id: 'companyEmail',
      text: 'Company Email',
      placeholder: 'ceo@google.com',
      value: accountInfo.companyEmail,
    },
  ]
  useEffect(() => {
    let entries = Object.keys(initialPersonalAccount).map((key) => ({
      [key]: accountInfo[key],
    }))

    let acc: PersonalAccount = initialPersonalAccount

    for (const entry of entries) {
      acc = {
        ...acc,
        ...entry,
      }
    }

    setPersonalInfo(acc)
  }, [accountInfo])

  return (
    <>
      {/* Company Info */}
      <h1 className="mt-0 w-fit border-b-2 p-4 pl-0 text-2xl font-bold text-green-increased-value">
        Company Info
      </h1>
      <div className="flex gap-8">
        {companyInfo.map((data, index) => (
          <div key={index}>
            <label htmlFor={data.id} className={styles.gray_input_label}>
              {data.text}
              <span className=" text-red-decreased-value">{' *'}</span>
            </label>
            <input
              name={data.id}
              id={data.id}
              value={data.value}
              onChange={handleInputChange}
              className={styles.gray_input + ' w-[230px]'}
              placeholder={data.placeholder}
              required
            />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-8">
        <div id="home_address">
          <label htmlFor="companyHouseNo" className={styles.gray_input_label}>
            Company Address
            <span className=" text-red-decreased-value">{' *'}</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="House Number"
              value={accountInfo.companyHouseNo}
              onChange={handleInputChange}
              id="companyHouseNo"
              name="companyHouseNo"
              className={styles.gray_input + ' w-32'}
              required
            />
            <input
              type="text"
              placeholder="Street"
              id="companyStreet"
              name="companyStreet"
              className={styles.gray_input + ' w-40'}
              required
              value={accountInfo.companyStreet}
              onChange={handleInputChange}
            ></input>
            <input
              type="text"
              placeholder="City"
              id="companyCity"
              name="companyCity"
              value={accountInfo.companyCity}
              onChange={handleInputChange}
              className={styles.gray_input + ' w-36'}
              required
            ></input>
            <input
              type="text"
              placeholder="State"
              id="companyState"
              name="companyState"
              value={accountInfo.companyState}
              onChange={handleInputChange}
              className={styles.gray_input + ' w-36'}
              required
            ></input>
            <input
              type="text"
              placeholder="Zip Code"
              id="companyZipCode"
              name="companyZipCode"
              value={accountInfo.companyZipCode}
              onChange={handleInputChange}
              className={styles.gray_input + ' w-20'}
              required
            ></input>
            <input
              type="text"
              placeholder="Country"
              id="companyCountry"
              name="companyCountry"
              value={accountInfo.companyCountry}
              onChange={handleInputChange}
              className={styles.gray_input + ' w-20'}
            ></input>
          </div>
        </div>
      </div>
      {/* Company Owner Info */}
      <h1 className="mt-4 w-fit border-b-2 p-4 pl-0 text-2xl font-bold text-green-increased-value">
        Company Owner Info
      </h1>
      <PersonalAccountSettings
        styles={styles}
        accountInfo={personalInfo}
        handleInputChange={handleInputChange}
        handleSelectChange={handleSelectChange}
      />
    </>
  )
}

export default BusinessAccountSettings
