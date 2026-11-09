import { buildBeneficiary, fieldLabel, fieldOptions } from '@/lib/transferFields';

describe('fieldOptions', () => {
  it('keeps account and beneficiary combinations separately', () => {
    const options = fieldOptions({
      credit_party_identifier: [['msisdn'], ['bank_account_number', 'swift_bic_code']],
      beneficiary: [['firstname', 'lastname']],
    });
    expect(options.credit_party_identifier).toEqual([['msisdn'], ['bank_account_number', 'swift_bic_code']]);
    expect(options.beneficiary).toEqual([['firstname', 'lastname']]);
  });

  it('treats legacy flat lists as account combinations', () => {
    expect(fieldOptions(['msisdn', ['iban', 'swift_bic_code']]).credit_party_identifier).toEqual([
      ['msisdn'],
      ['iban', 'swift_bic_code'],
    ]);
    expect(fieldOptions(undefined)).toEqual({ credit_party_identifier: [], beneficiary: [] });
  });
});

describe('buildBeneficiary', () => {
  it('sends only the chosen combination and drops blank values', () => {
    const options = fieldOptions({
      credit_party_identifier: [['msisdn'], ['bank_account_number', 'swift_bic_code']],
      beneficiary: [['firstname', 'lastname']],
    });
    const body = buildBeneficiary(
      options,
      { credit_party_identifier: 1, beneficiary: 0 },
      {
        'credit_party_identifier.msisdn': '2588',
        'credit_party_identifier.bank_account_number': ' 123 ',
        'credit_party_identifier.swift_bic_code': '',
        'beneficiary.firstname': 'Ana',
        'beneficiary.lastname': 'Mabunda',
      },
    );
    expect(body).toEqual({
      credit_party_identifier: { bank_account_number: '123' },
      beneficiary: { firstname: 'Ana', lastname: 'Mabunda' },
    });
  });
});

it('formats provider field names for display', () => {
  expect(fieldLabel('bank_account_number')).toBe('Bank account number');
});
