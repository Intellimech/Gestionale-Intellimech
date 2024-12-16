import React, { useMemo, useEffect } from 'react';
import Select from 'react-tailwindcss-select';
import { TrashIcon } from '@heroicons/react/20/solid';

export default function PurchaseUpdateRow({
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
  useEffect(() => {}, [product.taxed_unit_price, product.vat, product.quantity]);
  useEffect(() => {}, [subcategories]);
  
  const details = ['Primo e Ultimo anno metà importo ', 'Importo uguale ogni anno.'];
  const Vat = ['22', '10', '4', '0'];
  const handleDeleteClick = () => {
    const confirmed = window.confirm('Sei sicuro di voler eliminare questo prodotto?');
    if (confirmed) {
      onRemove(index);
    }
  };
// Precompilazione di Aliquota e Anni se Ammortamento è abilitato
useEffect(() => {
  if (product.depreciation) {
    const category = categories.find((c) => c.id_category === product.category);
    const subcategory = subcategories.find((s) => s.id_subcategory === product.subcategory);
    const subsubcategory = subsubcategories.find((s) => s.id_subsubcategory === product.subsubcategory);

    const depreciation_aliquota = subsubcategory?.aliquota || subcategory?.aliquota || category?.aliquota || null;
    const depreciation_years = subsubcategory?.years || subcategory?.years || category?.years || null;

    if (depreciation_aliquota && depreciation_years) {
      onChange({ ...product, depreciation_aliquota, depreciation_years });
    }
  }
}, [product.depreciation, product.category, product.subcategory, product.subsubcategory]);

  // Calculate totals
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

  useEffect(() => {
    if (product.unit_price || product.vat) {
      const unitPrice = parseFloat(product.unit_price);
      const vatRate = parseFloat(product.vat);
      const quantity = parseFloat(product.quantity) || 0;
  
      // Calculate taxed unit price (price without VAT)
      const taxedUnitPrice = unitPrice * (1 + vatRate / 100);
  
      // Calculate totals
      const totalTaxed = taxedUnitPrice * quantity;
      const total = unitPrice * quantity;
  
      onChange({
        ...product,
        taxed_unit_price: taxedUnitPrice.toFixed(2),
         taxed_totalprice: totalTaxed.toFixed(2),
       totalprice: total.toFixed(2)
      });
    }
  }, [product.unit_price, product.vat, product.quantity]);

  return (
    <div className="border border-gray-200 rounded p-2 text-xs">
      <table className="w-full text-left text-[10px] border-collapse">
        <tbody>
          {/* Categoria e Sottocategoria */}
          <tr>
            <td className="block text-[11px] font-medium text-gray-700">Macro Categoria</td>
            <td className="w-3/4">
              <Select
                id={`category-${index}`}
                placeholder="Seleziona"
                value={
                  product.category
                    ? { value: product.category, label: categories.find(c => c.id_category === product.category)?.name }
                    : null
                }
                onChange={(option) => {
                  const selectedCategory = option?.value || null;
                  onChange({ ...product, category: selectedCategory, subcategory: '', subsubcategory: '' });
                  handleCategoryChange(index, selectedCategory);
                }}
                options={categories.map(c => ({ value: c.id_category, label: c.name }))}
                className="text-[10px]"
                primaryColor="#7fb7d4"
                isSearchable
              />
            </td>
          </tr>
          <tr>
            <td className="block text-[11px] font-medium text-gray-700">Categoria</td>
            <td>
              <Select
                id={`subcategory-${index}`}
                placeholder="Seleziona"
                value={
                  product.subcategory
                    ? { value: product.subcategory, label: subcategories.find(s => s.id_subcategory === product.subcategory)?.name }
                    : null
                }
                onChange={(option) => {
                  const selectedSubcategory = option?.value || null;
                  onChange({ ...product, subcategory: selectedSubcategory, subsubcategory: '' });
                  handleSubcategoryChange(index, selectedSubcategory);
                }}
                options={subcategories.map(s => ({ value: s.id_subcategory, label: s.name }))}
                className="text-[10px]"
                isSearchable
                primaryColor="#7fb7d4"
              />
            </td>
          </tr>
          <tr>
            <td className="block text-[11px] font-medium text-gray-700">Sottocategoria</td>
            <td>
              <Select
                id={`subsubcategory-${index}`}
                placeholder="Seleziona"
                value={
                  product.subsubcategory
                    ? { value: product.subsubcategory, label: subsubcategories.find(s => s.id_subsubcategory === product.subsubcategory)?.name }
                    : null
                }
                onChange={(option) => onChange({ ...product, subsubcategory: option.value })}
                options={subsubcategories?.map(s => ({ value: s.id_subsubcategory, label: s.name }))}
                className="text-[10px]"
                isDisabled={subcategories.length === 0}
                primaryColor="#7fb7d4"
              />
            </td>
          </tr>
          <tr>
            <td className="block text-[11px] font-medium text-gray-700">Description</td>
            <td>
              <input
                type="text"
                value={product.description || ''}
                onChange={(e) => onChange({ ...product, description: e.target.value })}
                className="w-full text-[12px] rounded border-gray-300"
                placeholder= "Descrizione"
              />
            </td>
          </tr>
          {/* Prezzi e Quantità */}
          <tr>
            <td className="block text-[11px] font-medium text-gray-700">Quantità</td>
            <td>
              <input
                type="number"
                value={product.quantity || ''}
                onChange={(e) => onChange({ ...product, quantity: e.target.value })}
                className="w-full text-[12px] rounded border-gray-300"
              />
            </td>
          </tr>
          <tr>
            <td className="block text-[11px] font-medium text-gray-700">Importo Unitario IVA Esclusa</td>
            <td>
              <input
                type="number"
                value={product.unit_price || calculatedTotal}
                onChange={(e) => onChange({ ...product, unit_price: e.target.value })}
                className="w-full text-[12px] rounded border-gray-300"
              />
            </td>
          </tr> <tr>
            <td className="block text-[11px] font-medium text-gray-700">Importo Totale IVA Esclusa</td>
            <td>
              <input
                type="number"
                value={product.totalprice}
                onChange={(e) => onChange({ ...product, totalprice: e.target.value })}
                className="w-full text-[12px] rounded border-gray-300"
              />
            </td>
          </tr>
         
         <tr>
            <td className="block text-[11px] font-medium text-gray-700">IVA</td>
            <td>
              <Select
                id={`vat-${index}`}
                value={product.vat ? { value: product.vat, label: product.vat } : null}
                onChange={(option) => onChange({ ...product, vat: option?.value || null })}
                options={Vat.map(v => ({ value: v, label: v }))}
                placeholder="IVA"
                className="text-[12px] rounded-md border-gray-300"
              />
            </td>
          </tr>

          {/* Totali */}
           <tr>
            <td className="block text-[11px] font-medium text-gray-700">Importo Unitario IVA Inclusa</td>
            <td>
              <input
                type="number"
                value={product.taxed_unit_price}
                onChange={(e) => onChange({ ...product, taxed_unit_price: e.target.value })}
                className="w-full text-[12px] rounded border-gray-300"
              />
            </td>
          </tr>
          <tr>
            <td className="block text-[11px] font-medium text-gray-700">Importo Totale IVA Inclusa</td>
            <td>
              <input
                type="number"
                value={product.taxed_totalprice}
                onChange={(e) => onChange({ ...product, taxed_totalprice: e.target.value })}
                className="w-full text-[12px] rounded border-gray-300"
              />
            </td>
          </tr>

          <br/>
          {/* Asset e Ammortamento */}
          <tr>
            <td className="block text-[11px] font-medium text-gray-700">Asset</td>
            <td>
              <input
                type="checkbox"
                checked={product.asset || false}
                onChange={(e) => onChange({ ...product, asset: e.target.checked })}
                className="h-3 w-3 text-[#7fb7d4]"
              />
            </td>
          </tr>
          <br/>
          <tr>
            <td className="block text-[11px] font-medium text-gray-700">Ammortamento</td>
            <td>
              <input
                type="checkbox"
                checked={product.depreciation || false}
                onChange={(e) => onChange({ ...product, depreciation: e.target.checked })}
                className="h-3 w-3 text-[#7fb7d4]"
              />
             </td>
           

            </tr>
            <br/>
           
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

          {/* Azione Elimina */}
          <tr>
            <td colSpan="4" className="text-right py-1">
              <button
                type="button"
                onClick={handleDeleteClick}
                className="text-red-500 hover:text-red-700"
              >
                <TrashIcon className="h-5 w-5 inline" /> Rimuovi
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
