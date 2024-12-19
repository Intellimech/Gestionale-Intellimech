import React, { useMemo, useEffect, useState } from 'react';
import Select from 'react-tailwindcss-select';
import { TrashIcon } from '@heroicons/react/20/solid';

export default function PurchaseRowInput({
  product,
  index,
  categories,
  subcategories,
  subsubcategories,
  onChange,
  onRemove,
  handleCategoryChange,
  handleSubcategoryChange,
}) {
  const handleDeleteClick = () => {
    const confirmed = window.confirm('Sei sicuro di voler eliminare questo prodotto?');
    if (confirmed) {
      onRemove(index);
    }
  };
  useEffect(() => {
    if (product.taxed_unit_price && product.vat) {
      // Converto i valori in numeri per essere sicuro di fare calcoli corretti
      const taxedUnitPrice = parseFloat(product.taxed_unit_price);
      const vatRate = parseFloat(product.vat);
      
      // Calcolo del prezzo IVA inclusa
      const unitPriceWithVat = taxedUnitPrice * (1 + vatRate / 100);
      
      // Aggiorno il prezzo unitario IVA inclusa
      onChange({
        ...product,
        unit_price: unitPriceWithVat.toFixed(2),
        // Aggiorno anche il totale IVA inclusa
        total: (unitPriceWithVat * (parseFloat(product.quantity) || 0)).toFixed(2)
      });
    }
  }, [product.taxed_unit_price, product.vat, product.quantity]);

  const Vat = ['22', '10', '4', '0'];

  const [selectedDetail, setSelectedDetail] = useState(null);
  const details = ['Primo e Ultimo anno metà importo ', 'Importo uguale ogni anno'];
  useEffect(() => {
    // Imposta IVA di default a 22% se non è già definita
    if (!product.vat) {
      onChange({ ...product, vat: '22' });
    }
  }, []);
  useEffect(() => {
    if (product.depreciation) {
      const category = categories.find((c) => c.id_category === product.category);
      const subcategory = subcategories.find((s) => s.id_subcategory === product.subcategory);
      const subsubcategory = subsubcategories.find((s) => s.id_subsubcategory === product.subsubcategory);

      const depreciation_aliquota = subsubcategory?.aliquota || subcategory?.aliquota || category?.aliquota || null;
      const depreciation_years = subsubcategory?.years || subcategory?.years || category?.years || null;
      const depreciation_details = subsubcategory?.details || subcategory?.details || category?.details || null;
      

      if (depreciation_aliquota && depreciation_years && depreciation_details) {
        onChange({ ...product, depreciation_aliquota, depreciation_years, depreciation_details });
      }
    }
  }, [product.depreciation, product.category, product.subcategory, product.subsubcategory]);

  const calculatedTotalTassato = useMemo(() => {
    const taxedUnitPrice = parseFloat(product.taxed_unit_price || 0);
    const quantity = parseFloat(product.quantity || 0);
    return (taxedUnitPrice * quantity).toFixed(2);
  }, [product.taxed_unit_price, product.quantity]);

  const calculatedTotal = useMemo(() => {
    const unitPrice = parseFloat(product.unit_price || 0);
    const quantity = parseFloat(product.quantity || 0);
    return (unitPrice * quantity).toFixed(2);
  }, [product.unit_price, product.quantity]);

  return (
    <div className="border border-gray-200 rounded p-2 text-xs">
      <table className="w-full text-left text-[10px] border-collapse">
        <tbody>
          {/* Categoria e Sottocategoria */}
          <tr>
            <td className="block text-[11px] font-medium text-gray-700 p-1">Macro Categoria</td>
            <td className="w-3/4 p-1">
              <Select
                placeholder="Seleziona macro categoria"
                value={product.category ? { 
                  value: product.category, 
                  label: categories.find(c => c.id_category === product.category)?.name 
                } : null}
                onChange={(option) => {
                  handleCategoryChange({ target: { value: option.value } });
                  onChange({ ...product, category: option.value });
                }}
                options={categories?.map(c => ({ value: c?.id_category, label: c?.name }))} 
                className="text-xs"
                primaryColor="#7fb7d4"
                isSearchable
                isClearable
              />
            </td>
          </tr>
  
          <tr>
            <td className="block text-[11px] font-medium text-gray-700 p-1">Categoria</td>
            <td className="w-3/4 p-1">
              <Select
                placeholder="Seleziona categoria"
                value={product.subcategory ? { 
                  value: product.subcategory, 
                  label: subcategories.find(s => s.id_subcategory === product.subcategory)?.name 
                } : null}
                onChange={(option) => {
                  handleSubcategoryChange({ target: { value: option.value } });
                  onChange({ ...product, subcategory: option.value });
                }}
                options={subcategories?.map(s => ({ value: s.id_subcategory, label: s.name }))} 
                className="text-xs"
                isDisabled={subcategories.length === 0}
                primaryColor="#7fb7d4"
                isSearchable
                isClearable
              />
            </td>
          </tr>
  
          <tr>
            <td className="block text-[11px] font-medium text-gray-700 p-1">Sottocategoria</td>
            <td className="w-3/4 p-1">
              <Select
                placeholder="Seleziona sottocategoria"
                value={product.subsubcategory ? { 
                  value: product.subsubcategory, 
                  label: subsubcategories.find(s => s.id_subsubcategory === product.subsubcategory)?.name 
                } : null}
                onChange={(option) => onChange({ ...product, subsubcategory: option.value })}
                options={subsubcategories?.map(s => ({ value: s.id_subsubcategory, label: s.name }))} 
                className="text-xs"
                isDisabled={subcategories.length === 0}
                primaryColor="#7fb7d4"
                isSearchable
                isClearable
              />
            </td>
          </tr>
  
          {/* Descrizione e Quantità */}
          <tr>
            <td className="block text-[11px] font-medium text-gray-700 p-1">Descrizione</td>
            <td className="w-3/4 p-1">
              <textarea
                value={product.description}
                onChange={(e) => onChange({ ...product, description: e.target.value })}
                rows={1}
                maxLength={150}
                className="w-full text-xs rounded-md border-gray-300"
                placeholder="Descrizione"
              />
            </td>
          </tr>
  
          <tr>
            <td className="block text-[11px] font-medium text-gray-700 p-1">Quantità</td>
            <td className="w-3/4 p-1">
              <input
                type="number"
                value={product.quantity}
                onChange={(e) => onChange({ ...product, quantity: e.target.value })}
                className="w-full text-xs rounded-md border-gray-300"
                placeholder="Qty"
              />
            </td>
          </tr>
  
          <tr>
            <td className="block text-[11px] font-medium text-gray-700 p-1">Importo Unitario IVA Esclusa</td>
            <td className="w-3/4 p-1">
              <input
                type="number"
                value={product.taxed_unit_price}
                onChange={(e) => onChange({ ...product, taxed_unit_price: e.target.value })}
                className="w-full text-xs rounded-md border-gray-300"
                placeholder="Importo"
              />
            </td>
          </tr>
  
          {/* Totale e IVA */}
          <tr>
            <td className="block text-[11px] font-medium text-gray-700 p-1">Importo Totale IVA Esclusa</td>
            <td className="w-3/4 p-1">
              <input
                type="number"
                value={product.total_taxed || calculatedTotalTassato}
                onChange={(e) => onChange({ ...product, total_taxed: e.target.value })}
                className="w-full text-xs rounded-md border-gray-300"
                disabled
              />
            </td>
          </tr>
  
          <tr>
            <td className="block text-[11px] font-medium text-gray-700 p-1">IVA</td>
            <td className="w-3/4 p-1">
              <Select
                placeholder="IVA"
                value={product.vat ? { value: product.vat, label: product.vat } : null}
                onChange={(option) => onChange({ ...product, vat: option.value })}
                options={Vat.map(v => ({ value: v, label: v }))}
                className="text-xs"
                primaryColor="#7fb7d4"
                isSearchable
              />
            </td>
          </tr>
  
          {/* Importo IVA Inclusa e Totale IVA Inclusa */}
          <tr>
            <td className="block text-[11px] font-medium text-gray-700 p-1">Importo Unitario IVA Inclusa</td>
            <td className="w-3/4 p-1">
              <input
                type="number"
                value={product.unit_price}
                onChange={(e) => onChange({ ...product, unit_price: e.target.value })}
                className="w-full text-xs rounded-md border-gray-300"
                placeholder="Importo IVA"
                disabled
              />
            </td>
          </tr>
  
          <tr>
            <td className="block text-[11px] font-medium text-gray-700 p-1">Importo Totale IVA Inclusa</td>
            <td className="w-3/4 p-1">
              <input
                type="number"
                value={product.total || calculatedTotal}
                onChange={(e) => onChange({ ...product, total: e.target.value })}
                className="w-full text-xs rounded-md border-gray-300"
                disabled
              />
            </td>
          </tr>
  
      {/* Asset e Ammortamento */}
     
          <tr>
            <td className="block text-[11px] font-medium text-gray-700">Cespite / Ammortamento</td>
            <td>
              <input
                type="checkbox"
                checked={product.depreciation || false}
                onChange={(e) => onChange({ ...product, depreciation: e.target.checked })}
                className="h-3 w-3 text-[#7fb7d4]"
              />
            </td>
          </tr>
          {/* Campi aggiuntivi per depreciation_aliquota e years ammortamento */}
          {product.depreciation && (
            <>
              <tr>
                <td className="block text-[11px] font-medium text-gray-700">Aliquota (%)</td>
                <td className="w-3/4 p-1">
                  <input
                    type="number"
                    value={product.depreciation_aliquota || ''}
                    onChange={(e) => onChange({ ...product, depreciation_aliquota: e.target.value })}
                    className="w-full text-xs rounded-md border-gray-300"
                    placeholder="Aliquota"
                    // Disabilita se depreciation_aliquota è già definita
                  />
                </td>
              </tr>
              <tr>
                <td className="block text-[11px] font-medium text-gray-700">Anni Ammortamento</td>
                <td className="w-3/4 p-1">
                  <input
                    type="number"
                    value={product.depreciation_years || ''}
                    onChange={(e) => onChange({ ...product, depreciation_years: e.target.value })}
                    className="w-full text-xs rounded-md border-gray-300"
                    placeholder="Anni"
                     // Disabilita se depreciation_years è già definito
                  />
                </td>
              </tr>
              <tr>
                <td className="block text-[11px] font-medium text-gray-700">Dettagli Ammortamento</td>
                <td className="w-3/4 p-1">
                <Select
                    value={product.depreciation_details ? { 
                      value: product.depreciation_details, 
                      label: product.depreciation_details
                    } : null}
                    onChange={(e) => onChange({ ...product, depreciation_details: e.value })}
                    options={details.map((b) => ({ value: b , label: b }))}
                    className="w-full text-[8px] rounded-md border-gray-300"
                    placeholder="Dettagli"
                     // Disabilita se depreciation_years è già definito
                  />
                </td>
              </tr>
             
            </>
          )}

          <tr>
            <td className="p-2 flex justify-end">
              <button
                type="button"
                onClick={handleDeleteClick}
                className="text-blue-500 hover:text-blue-900"
              >
                <TrashIcon className="h-4 w-4" aria-hidden="true" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}