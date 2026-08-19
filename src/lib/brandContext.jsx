import React, { createContext, useContext, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const BrandContext = createContext({ brands: [], activeBrand: "All", setActiveBrand: () => {}, loading: true });

export function BrandProvider({ children }) {
  const [brands, setBrands] = useState([]);
  const [activeBrand, setActiveBrand] = useState(() => localStorage.getItem("bp-brand") || "All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Brand.list().then((b) => {
      setBrands(b);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem("bp-brand", activeBrand);
  }, [activeBrand]);

  return (
    <BrandContext.Provider value={{ brands, activeBrand, setActiveBrand, loading }}>
      {children}
    </BrandContext.Provider>
  );
}

export const useBrand = () => useContext(BrandContext);
