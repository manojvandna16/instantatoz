import locationData from '../data/uttarkashi_locations.json';

export interface LocationVillage {
  id: string;
  code: number;
  name: string;
}

export interface LocationTehsil {
  id: string;
  code: number;
  name: string;
  villages: LocationVillage[];
}

export interface LocationScope {
  stateId: string;
  stateName: string;
  districtId: string;
  districtName: string;
  districtCode: number;
}

export interface LocationMasterData {
  schemaVersion: string;
  sourceFile: string;
  sourceNote: string;
  scope: LocationScope;
  tehsils: LocationTehsil[];
}

const masterData = locationData as LocationMasterData;

export const LocationUtils = {
  getScope: () => masterData.scope,
  
  getTehsils: () => masterData.tehsils.map(t => ({ id: t.id, name: t.name, code: t.code })),
  
  getVillagesForTehsil: (tehsilId: string) => {
    const tehsil = masterData.tehsils.find(t => t.id === tehsilId);
    return tehsil ? tehsil.villages : [];
  },

  validateLocationHierarchy: (stateId: string, districtId: string, tehsilId: string, villageId: string): boolean => {
    if (stateId !== masterData.scope.stateId || districtId !== masterData.scope.districtId) {
      return false;
    }
    
    const tehsil = masterData.tehsils.find(t => t.id === tehsilId);
    if (!tehsil) return false;

    const village = tehsil.villages.find(v => v.id === villageId);
    if (!village) return false;

    return true;
  },

  getNames: (tehsilId: string, villageId: string) => {
    const tehsil = masterData.tehsils.find(t => t.id === tehsilId);
    const village = tehsil?.villages.find(v => v.id === villageId);
    return {
      tehsilName: tehsil?.name,
      villageName: village?.name
    };
  }
};
