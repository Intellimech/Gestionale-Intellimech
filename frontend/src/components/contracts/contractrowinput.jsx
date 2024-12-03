import React, { useMemo, useEffect } from 'react';
import Select from 'react-tailwindcss-select';
import { TrashIcon } from '@heroicons/react/20/solid';

export default function ContractRowInput({
  contract,
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
    if (contract.taxed_unit_price && contract.vat) {
      // Converto i valori in numeri per essere sicuro di fare calcoli corretti
      const taxedUnitPrice = parseFloat(contract.taxed_unit_price);
      const vatRate = parseFloat(contract.vat);
      
      // Calcolo del prezzo IVA inclusa
      const unitPriceWithVat = taxedUnitPrice * (1 + vatRate / 100);
      
      // Aggiorno il prezzo unitario IVA inclusa
      onChange({
        ...contract,
        unit_price: unitPriceWithVat.toFixed(2),
        // Aggiorno anche il totale IVA inclusa
        total: (unitPriceWithVat * (parseFloat(contract.quantity) || 0)).toFixed(2)
      });
    }
  }, [contract.taxed_unit_price, contract.vat, contract.quantity]);

  const Vat = ['22', '10', '4', '0'];


 

  const calculatedTotalTassato = useMemo(() => {
    const taxedUnitPrice = parseFloat(contract.taxed_unit_price || 0);
    const quantity = parseFloat(contract.quantity || 0);
    return (taxedUnitPrice * quantity).toFixed(2);
  }, [contract.taxed_unit_price, contract.quantity]);

  const calculatedTotal = useMemo(() => {
    const unitPrice = parseFloat(contract.unit_price || 0);
    const quantity = parseFloat(contract.quantity || 0);
    return (unitPrice * quantity).toFixed(2);
  }, [contract.unit_price, contract.quantity]);

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
                value={contract.category ? { 
                  value: contract.category, 
                  label: categories.find(c => c.id_category === contract.category)?.name 
                } : null}
                onChange={(option) => {
                  handleCategoryChange({ target: { value: option.value } });
                  onChange({ ...contract, category: option.value });
                }}
                options={categories?.map(c => ({ value: c?.id_category, label: c?.name }))} 
                className="text-xs"
                primaryColor="#7fb7d4"
                isSearchable
              />
            </td>
          </tr>
  
          <tr>
            <td className="block text-[11px] font-medium text-gray-700 p-1">Categoria</td>
            <td className="w-3/4 p-1">
              <Select
                placeholder="Seleziona categoria"
                value={contract.subcategory ? { 
                  value: contract.subcategory, 
                  label: subcategories.find(s => s.id_subcategory === contract.subcategory)?.name 
                } : null}
                onChange={(option) => {
                  handleSubcategoryChange({ target: { value: option.value } });
                  onChange({ ...contract, subcategory: option.value });
                }}
                options={subcategories?.map(s => ({ value: s.id_subcategory, label: s.name }))} 
                className="text-xs"
                isDisabled={subcategories?.length === 0}
                primaryColor="#7fb7d4"
                isSearchable
              />
            </td>
          </tr>
  
          <tr>
            <td className="block text-[11px] font-medium text-gray-700 p-1">Sottocategoria</td>
            <td className="w-3/4 p-1">
              <Select
                placeholder="Seleziona sottocategoria"
                value={contract.subsubcategory ? { 
                  value: contract.subsubcategory, 
                  label: subsubcategories.find(s => s.id_subsubcategory === contract.subsubcategory)?.name 
                } : null}
                onChange={(option) => onChange({ ...contract, subsubcategory: option.value })}
                options={subsubcategories?.map(s => ({ value: s.id_subsubcategory, label: s.name }))} 
                className="text-xs"
                isDisabled={subcategories?.length === 0}
                primaryColor="#7fb7d4"
                isSearchable
              />
            </td>
          </tr>
  
          {/* Descrizione e Quantità */}
          <tr>
            <td className="block text-[11px] font-medium text-gray-700 p-1">Descrizione</td>
            <td className="w-3/4 p-1">
              <textarea
                value={contract.description}
                onChange={(e) => onChange({ ...contract, description: e.target.value })}
                rows={1}
                maxLength={150}
                className="w-full text-xs rounded-md border-gray-300"
                placeholder="Descrizione"
              />
            </td>
          </tr>
  
          {/* <tr>
            <td className="block text-[11px] font-medium text-gray-700 p-1">Quantità</td>
            <td className="w-3/4 p-1">
              <input
                type="number"
                value={contract.quantity}
                onChange={(e) => onChange({ ...contract, quantity: e.target.value })}
                className="w-full text-xs rounded-md border-gray-300"
                placeholder="Qty"
              />
            </td>
          </tr> */}
  
          <tr>
            <td className="block text-[11px] font-medium text-gray-700 p-1">Importo Ricorrente (IVA Esclusa)</td>
            <td className="w-3/4 p-1">
              <input
                type="number"
                value={contract.taxed_unit_price}
                onChange={(e) => onChange({ ...contract, taxed_unit_price: e.target.value })}
                className="w-full text-xs rounded-md border-gray-300"
                placeholder="Prezzo"
              />
            </td>
          </tr>
{/*   
         
          <tr>
            <td className="block text-[11px] font-medium text-gray-700 p-1">Totale (IVA Esclusa)</td>
            <td className="w-3/4 p-1">
              <input
                type="number"
                value={contract.total_taxed || calculatedTotalTassato}
                onChange={(e) => onChange({ ...contract, total_taxed: e.target.value })}
                className="w-full text-xs rounded-md border-gray-300"
                disabled
              />
            </td>
          </tr>
   */}
          <tr>
            <td className="block text-[11px] font-medium text-gray-700 p-1">IVA</td>
            <td className="w-3/4 p-1">
              <Select
                placeholder="IVA"
                value={contract.vat ? { value: contract.vat, label: contract.vat } : null}
                onChange={(option) => onChange({ ...contract, vat: option.value })}
                options={Vat.map(v => ({ value: v, label: v }))}
                className="text-xs"
                primaryColor="#7fb7d4"
                isSearchable
              />
            </td>
          </tr>
  
          {/* Prezzo IVA Inclusa e Totale IVA Inclusa */}
          <tr>
            <td className="block text-[11px] font-medium text-gray-700 p-1">Importo Ricorrente (IVA Inclusa)</td>
            <td className="w-3/4 p-1">
              <input
                type="number"
                value={contract.unit_price}
                onChange={(e) => onChange({ ...contract, unit_price: e.target.value })}
                className="w-full text-xs rounded-md border-gray-300"
                placeholder="Prezzo IVA"
                disabled
              />
            </td>
          </tr>
  
          {/* <tr>
            <td className="block text-[11px] font-medium text-gray-700 p-1">Totale (IVA Inclusa)</td>
            <td className="w-3/4 p-1">
              <input
                type="number"
                value={contract.total || calculatedTotal}
                onChange={(e) => onChange({ ...contract, total: e.target.value })}
                className="w-full text-xs rounded-md border-gray-300"
                disabled
              />
            </td>
          </tr>
  
          */}
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