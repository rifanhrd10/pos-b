"use client";

import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useOnboardingStore } from "@/hooks/use-onboarding-store";

interface Option {
  value: string;
  label: string;
}

export default function RegionSelects() {
  const { business, setBusiness } = useOnboardingStore();
  
  const [provinces, setProvinces] = useState<Option[]>([]);
  const [regencies, setRegencies] = useState<Option[]>([]);
  const [districts, setDistricts] = useState<Option[]>([]);
  const [villages, setVillages] = useState<Option[]>([]);

  const [selectedProvince, setSelectedProvince] = useState<Option | null>(null);
  const [selectedRegency, setSelectedRegency] = useState<Option | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<Option | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<Option | null>(null);

  const [loadingProvince, setLoadingProvince] = useState(true);
  const [loadingRegency, setLoadingRegency] = useState(false);
  const [loadingDistrict, setLoadingDistrict] = useState(false);
  const [loadingVillage, setLoadingVillage] = useState(false);

  useEffect(() => {
    fetch("/api/wilayah/provinces.json")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.data) {
          setProvinces(
            data.data.map((item: any) => ({
              value: item.code,
              label: item.name,
            }))
          );
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingProvince(false));
  }, []);

  const handleProvinceChange = (option: Option | null) => {
    setSelectedProvince(option);
    setSelectedRegency(null);
    setSelectedDistrict(null);
    setSelectedVillage(null);
    setRegencies([]);
    setDistricts([]);
    setVillages([]);
    
    if (option) {
      setBusiness({ province: option.label });
    }

    if (option) {
      setLoadingRegency(true);
      fetch(`/api/wilayah/regencies/${option.value}.json`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.data) {
            setRegencies(
              data.data.map((item: any) => ({
                value: item.code,
                label: item.name,
              }))
            );
          }
        })
        .finally(() => setLoadingRegency(false));
    }
  };

  const handleRegencyChange = (option: Option | null) => {
    setSelectedRegency(option);
    setSelectedDistrict(null);
    setSelectedVillage(null);
    setDistricts([]);
    setVillages([]);
    
    if (option) {
      setBusiness({ city: option.label });
    }

    if (option) {
      setLoadingDistrict(true);
      fetch(`/api/wilayah/districts/${option.value}.json`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.data) {
            setDistricts(
              data.data.map((item: any) => ({
                value: item.code,
                label: item.name,
              }))
            );
          }
        })
        .finally(() => setLoadingDistrict(false));
    }
  };

  const handleDistrictChange = (option: Option | null) => {
    setSelectedDistrict(option);
    setSelectedVillage(null);
    setVillages([]);
    
    if (option) {
      setBusiness({ district: option.label });
    }

    if (option) {
      setLoadingVillage(true);
      fetch(`/api/wilayah/villages/${option.value}.json`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.data) {
            setVillages(
              data.data.map((item: any) => ({
                value: item.code,
                label: item.name,
              }))
            );
          }
        })
        .finally(() => setLoadingVillage(false));
    }
  };

  const handleVillageChange = (option: Option | null) => {
    setSelectedVillage(option);
    if (option) {
      setBusiness({ subdistrict: option.label });
    }
  };

  const customClassNames = {
    control: (state: any) =>
      `flex items-center w-full px-1 py-1.5 border rounded-lg text-on-surface font-body-md text-body-md transition-all bg-surface-container-lowest cursor-pointer ${
        state.isFocused
          ? "border-primary ring-2 ring-primary/20"
          : "border-outline-variant/50 hover:border-outline-variant/80"
      }`,
    valueContainer: () => "px-2",
    placeholder: () => "text-outline/50 font-body-md",
    singleValue: () => "text-on-surface font-body-md",
    input: () => "text-on-surface font-body-md m-0 p-0",
    menu: () => "mt-2 bg-surface-container-lowest border border-outline-variant/50 rounded-lg shadow-lg overflow-hidden z-50",
    menuList: () => "p-1 max-h-60 overflow-y-auto",
    option: (state: any) =>
      `px-3 py-2.5 rounded-md cursor-pointer text-body-md font-body-md transition-colors ${
        state.isSelected
          ? "bg-primary/10 text-primary font-medium"
          : state.isFocused
          ? "bg-surface-container-low text-on-surface"
          : "text-on-surface hover:bg-surface-container-low"
      }`,
    indicatorSeparator: () => "bg-outline-variant/30 mx-2",
    dropdownIndicator: () => "text-outline hover:text-on-surface p-1",
    clearIndicator: () => "text-outline hover:text-error p-1",
  };

  return (
    <div className="space-y-6 w-full">
      {/* Hidden inputs to pass data to FormData on submit */}
      <input type="hidden" name="province" value={selectedProvince?.label || ""} />
      <input type="hidden" name="city" value={selectedRegency?.label || ""} />
      <input type="hidden" name="district" value={selectedDistrict?.label || ""} />
      <input type="hidden" name="village" value={selectedVillage?.label || ""} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-label-md text-label-md text-on-surface mb-2">
            Provinsi
          </label>
          <Select
            instanceId="select-province"
            options={provinces}
            value={selectedProvince}
            onChange={handleProvinceChange}
            isLoading={loadingProvince}
            isDisabled={loadingProvince}
            placeholder="Pilih Provinsi..."
            unstyled
            classNames={customClassNames}
            noOptionsMessage={() => "Tidak ada provinsi"}
          />
        </div>
        <div>
          <label className="block font-label-md text-label-md text-on-surface mb-2">
            Kota / Kabupaten
          </label>
          <Select
            instanceId="select-city"
            options={regencies}
            value={selectedRegency}
            onChange={handleRegencyChange}
            isLoading={loadingRegency}
            isDisabled={!selectedProvince}
            placeholder="Pilih Kota/Kabupaten..."
            unstyled
            classNames={customClassNames}
            noOptionsMessage={() => "Tidak ada data"}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block font-label-md text-label-md text-on-surface mb-2">
            Kecamatan
          </label>
          <Select
            instanceId="select-district"
            options={districts}
            value={selectedDistrict}
            onChange={handleDistrictChange}
            isLoading={loadingDistrict}
            isDisabled={!selectedRegency}
            placeholder="Pilih Kecamatan..."
            unstyled
            classNames={customClassNames}
            noOptionsMessage={() => "Tidak ada data"}
          />
        </div>
        <div>
          <label className="block font-label-md text-label-md text-on-surface mb-2">
            Kelurahan / Desa
          </label>
          <Select
            instanceId="select-village"
            options={villages}
            value={selectedVillage}
            onChange={handleVillageChange}
            isLoading={loadingVillage}
            isDisabled={!selectedDistrict}
            placeholder="Pilih Kelurahan/Desa..."
            unstyled
            classNames={customClassNames}
            noOptionsMessage={() => "Tidak ada data"}
          />
        </div>
      </div>
    </div>
  );
}
