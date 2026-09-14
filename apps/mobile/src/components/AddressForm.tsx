import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { COLORS } from '../constants';

export interface AddressData {
  country: string;
  state: string;
  district: string;
  tehsil: string;
  villageOrWard: string;
  locality: string;
}

interface AddressFormProps {
  value: AddressData | null;
  onChange: (address: AddressData) => void;
}

const DISTRICTS = ['Uttarkashi', 'Dehradun', 'Haridwar', 'Tehri Garhwal', 'Pauri Garhwal', 'Rudraprayag', 'Chamoli', 'Almora', 'Nainital', 'Udham Singh Nagar', 'Bageshwar', 'Champawat', 'Pithoragarh'];

const TEHSILS: Record<string, string[]> = {
  'Uttarkashi': ['Bhatwari', 'Dunda', 'Chinyalisaur', 'Barkot', 'Purola', 'Mori'],
  'Dehradun': ['Dehradun', 'Rishikesh', 'Vikasnagar', 'Chakrata', 'Kalsi', 'Tuni', 'Doiwala'],
  'Haridwar': ['Haridwar', 'Roorkee', 'Laksar', 'Bhagwanpur'],
  'Tehri Garhwal': ['Tehri', 'Narendranagar', 'Pratapnagar', 'Devprayag', 'Ghansali', 'Dhanaulti'],
};

export default function AddressForm({ value, onChange }: AddressFormProps) {
  const [data, setData] = useState<AddressData>({
    country: value?.country || 'India',
    state: value?.state || 'Uttarakhand',
    district: value?.district || '',
    tehsil: value?.tehsil || '',
    villageOrWard: value?.villageOrWard || '',
    locality: value?.locality || '',
  });

  const [districtModal, setDistrictModal] = useState(false);
  const [tehsilModal, setTehsilModal] = useState(false);

  useEffect(() => {
    onChange(data);
  }, [data]);

  const handleChange = (field: keyof AddressData, val: string) => {
    setData(prev => {
      const next = { ...prev, [field]: val };
      // Reset tehsil if district changes
      if (field === 'district' && val !== prev.district) {
        next.tehsil = '';
      }
      return next;
    });
  };

  const availableTehsils = data.district ? (TEHSILS[data.district] || []) : [];

  const renderPickerModal = (
    visible: boolean,
    setVisible: (v: boolean) => void,
    options: string[],
    field: keyof AddressData,
    title: string
  ) => (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerTitle}>Select {title}</Text>
          {options.length === 0 ? (
             <View style={{ width: '100%' }}>
               <TextInput
                 style={styles.input}
                 placeholder={`Enter ${title} manually`}
                 placeholderTextColor={COLORS.textMuted}
                 value={data[field]}
                 onChangeText={val => { handleChange(field, val); }}
                 onSubmitEditing={() => setVisible(false)}
                 autoFocus
               />
               <Text style={{color: COLORS.textMuted, fontSize: 12, marginTop: 8}}>
                 List not available for this {title}. Please type it.
               </Text>
             </View>
          ) : (
            <FlatList
              data={options}
              keyExtractor={item => item}
              style={{ maxHeight: 300, width: '100%' }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.pickerItem}
                  onPress={() => {
                    handleChange(field, item);
                    setVisible(false);
                  }}
                >
                  <Text style={[styles.pickerItemText, data[field] === item && styles.pickerItemTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}
          <TouchableOpacity style={styles.closeBtn} onPress={() => setVisible(false)}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.flex1}>
          <Text style={styles.label}>Country</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={data.country}
            editable={false}
          />
        </View>
        <View style={{ width: 12 }} />
        <View style={styles.flex1}>
          <Text style={styles.label}>State</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={data.state}
            editable={false}
          />
        </View>
      </View>

      <Text style={styles.label}>District</Text>
      <TouchableOpacity style={styles.dropdown} onPress={() => setDistrictModal(true)}>
        <Text style={data.district ? styles.dropdownText : styles.dropdownPlaceholder}>
          {data.district || 'Select District'}
        </Text>
        <Text style={styles.dropdownIcon}>▼</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Tehsil</Text>
      <TouchableOpacity 
        style={[styles.dropdown, !data.district && styles.disabledInput]} 
        onPress={() => data.district && setTehsilModal(true)}
        disabled={!data.district}
      >
        <Text style={data.tehsil ? styles.dropdownText : styles.dropdownPlaceholder}>
          {data.tehsil || (data.district ? 'Select Tehsil' : 'Select District first')}
        </Text>
        <Text style={styles.dropdownIcon}>▼</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Village / Ward</Text>
      <TextInput
        style={styles.input}
        value={data.villageOrWard}
        onChangeText={val => handleChange('villageOrWard', val)}
        placeholder="e.g. Joshiyara or Ward 5"
        placeholderTextColor={COLORS.textMuted}
      />

      <Text style={styles.label}>Locality / Street</Text>
      <TextInput
        style={styles.input}
        value={data.locality}
        onChangeText={val => handleChange('locality', val)}
        placeholder="e.g. Near Main Market"
        placeholderTextColor={COLORS.textMuted}
      />

      {renderPickerModal(districtModal, setDistrictModal, DISTRICTS, 'district', 'District')}
      {renderPickerModal(tehsilModal, setTehsilModal, availableTehsils, 'tehsil', 'Tehsil')}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', paddingBottom: 10 },
  row: { flexDirection: 'row', width: '100%' },
  flex1: { flex: 1 },
  label: { color: COLORS.text, fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    color: COLORS.text,
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: COLORS.background,
    color: COLORS.textMuted,
  },
  dropdown: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    color: COLORS.text,
    fontSize: 16,
  },
  dropdownPlaceholder: {
    color: COLORS.textMuted,
    fontSize: 16,
  },
  dropdownIcon: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: '100%',
    maxHeight: '80%',
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    alignItems: 'center',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  pickerItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    width: '100%',
  },
  pickerItemText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
  },
  pickerItemTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  closeBtn: {
    marginTop: 20,
    padding: 14,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  closeBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
