import { describe, expect, it } from 'vitest';
import { initialStationForm, validateStationForm, type StationFormValues } from './MyStationsPage';

function validForm(overrides: Partial<StationFormValues> = {}): StationFormValues {
  return {
    ...initialStationForm,
    name: 'Gulberg Charge Hub',
    address: 'Main Boulevard, Gulberg',
    city: 'Lahore',
    province: 'Punjab',
    longitude: '74.3436',
    latitude: '31.5204',
    priceAmount: '55',
    currency: 'PKR',
    billingType: 'PER_KWH',
    opensAt: '08:00',
    closesAt: '22:00',
    description: '',
    ...overrides,
  };
}

describe('validateStationForm', () => {
  it('returns no errors for a valid station form', () => {
    expect(validateStationForm(validForm())).toEqual({});
  });

  it('requires station name and address', () => {
    const errors = validateStationForm(validForm({ name: '', address: '' }));
    expect(errors.name).toBeTruthy();
    expect(errors.address).toBeTruthy();
  });

  it('validates longitude and latitude ranges', () => {
    const errors = validateStationForm(validForm({ longitude: '200', latitude: '-100' }));
    expect(errors.longitude).toBeTruthy();
    expect(errors.latitude).toBeTruthy();
  });

  it('validates non-negative price amount', () => {
    const errors = validateStationForm(validForm({ priceAmount: '-5' }));
    expect(errors.priceAmount).toBeTruthy();
  });

  it('validates operating hours in HH:mm format', () => {
    const errors = validateStationForm(validForm({ opensAt: '8am', closesAt: '25:00' }));
    expect(errors.opensAt).toBeTruthy();
    expect(errors.closesAt).toBeTruthy();
  });
});
