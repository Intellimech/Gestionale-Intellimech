import React, { useMemo,useEffect } from 'react';
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
  handleSubcategoryChange
}) {


  useEffect(() => {
  
  }, [product.taxed_unit_price, product.vat, product.quantity]);
  useEffect(() => {
  }, [subcategories]);

  
  const Vat = ['22', '10', '4', '0'];
  const handleDeleteClick = () => {
    const confirmed = window.confirm('Sei sicuro di voler eliminare questo prodotto?');
    if (confirmed) {
      onRemove(index);
    }
  };

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
  

  return (
    <tr>
      <td className="px-4 py-2 whitespace-nowrap">
        <label htmlFor={`category-${index}`} className="block text-sm font-medium text-gray-700">
          Macro Categoria
        </label>
        <Select
          id={`category-${index}`}
          name={`category-${index}`}
          placeholder="Seleziona una categoria"
          value={
            product.category
              ? { value: product.category, label: categories.find(c => c.id_category === product.category)?.name }
              : null
          }
          onChange={(option) => {
            const selectedCategory = option?.value || null;
            onChange({ ...product, category: selectedCategory, subcategory: '', subsubcategory: '' });
            handleCategoryChange(index, selectedCategory); // Aggiorna anche le sottocategorie disponibili
          }}
          options={categories.map(c => ({ value: c.id_category, label: c.name }))}
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:max-w-xs sm:text-sm sm:leading-6"
          primaryColor='#7fb7d4'
          isSearchable
        />

      </td>

      <td className="px-4 py-2 whitespace-nowrap">
        <label htmlFor={`subcategory-${index}`} className="block text-sm font-medium text-gray-700">
          Categoria
        </label>
        <Select
          id={`subcategory-${index}`}
          name={`subcategory-${index}`}
          placeholder="Seleziona una sottocategoria"
          value={
            product.subcategory
              ? { value: product.subcategory, label: subcategories.find(s => s.id_subcategory === product.subcategory)?.name }
              : null
          }
          onChange={(option) => {
            const selectedSubcategory = option?.value || null;
            onChange({ ...product, subcategory: selectedSubcategory, subsubcategory: '' });
            handleSubcategoryChange(index, selectedSubcategory); // Aggiorna le sotto-sottocategorie disponibili
          }}
          options={subcategories.map(s => ({ value: s.id_subcategory, label: s.name }))}
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:max-w-xs sm:text-sm sm:leading-6"
          isSearchable
          primaryColor='#7fb7d4'
        />

      </td>
      <td className="px-4 py-2 whitespace-nowrap">
        <label htmlFor={`subsubcategory-${index}`} className="block text-sm font-medium text-gray-700">
          Sottocategoria
        </label>
        <Select
          id={`subsubcategory-${index}`}
          name={`subsubcategory-${index}`}
          value={
            product.subsubcategory
              ? { value: product.subsubcategory, label: subsubcategories.find(s => s.id_subsubcategory === product.subsubcategory)?.name }
              : null
          }
          onChange={(option) => onChange({ ...product, subsubcategory: option.value })}
          options={subsubcategories?.map(s => ({ value: s.id_subsubcategory, label: s.name }))}
          placeholder="Seleziona una sottocategoria"
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:max-w-xs sm:text-sm sm:leading-6"
          isDisabled={subcategories.length === 0}
          primaryColor='[#7fb7d4]'
        />
      </td>
      <td className="px-4 py-2 whitespace-nowrap">
      <label htmlFor={`unit_price-${index}`} className="block text-sm font-medium text-gray-700">
        Importo Unitario IVA Inclusa
      </label>
      <input
          type="number"
          id={`unit_price-${index}`}
          value={product.unit_price}
          onChange={(e) => onChange({ ...product, unit_price: e.target.value })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
        />
      
    </td>
      <td className="px-4 py-2 whitespace-nowrap">
      <label htmlFor={`taxed_unit_price-${index}`} className="block text-sm font-medium text-gray-700">
        Importo Unitario IVA Esclusa
      </label>
      <input
          type="number"
          id={`taxed_unit_price-${index}`}
          value={product.taxed_unit_price || calculatedTotal}
          onChange={(e) => onChange({ ...product, taxed_unit_price: e.target.value })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
        />
      
    </td>
      {/* IVA */}
      <td className="px-4 py-2 whitespace-nowrap">
        <label htmlFor={`vat-${index}`} className="block text-sm font-medium text-gray-700">
          IVA
        </label>
        <Select
          id={`vat-${index}`}
          value={product.vat ? { value: product.vat, label: product.vat } : null}
          onChange={(option) => onChange({ ...product, vat: option?.value || null })} // Impostare vat su null se non selezionato
          options={Vat.map(v => ({ value: v, label: v }))}
          placeholder="Seleziona IVA"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-[#7fb7d4] sm:text-sm"
        />

      </td> 
   
    <td className="px-4 py-2 whitespace-nowrap">
      <label htmlFor={`quantity-${index}`} className="block text-sm font-medium text-gray-700">
        Quantità
      </label>
      <input
        type="number"
        id={`quantity-${index}`}
        name={`quantity-${index}`}
        value={product.quantity || ''}
        onChange={(e) => onChange({ ...product, quantity: e.target.value })}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
      />
</td>

<td className="px-4 py-2 whitespace-nowrap">
        <label htmlFor={`totalprice-${index}`} className="block text-sm font-medium text-gray-700">
          Importo Totale IVA Esclusa
        </label>
        <input
          type="number"
          id={`totalprice-${index}`}
          value={product.totalprice }
          onChange={(e) => onChange({ ...product, totalprice: e.target.value })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
        />
      </td>

    <td className="px-4 py-2 whitespace-nowrap">
        <label htmlFor={`taxed_totalprice-${index}`} className="block text-sm font-medium text-gray-700">
          Importo Totale IVA Inclusa
        </label>
        <input
          type="number"
          id={`taxed_totalprice-${index}`}
          value={product.taxed_totalprice ||  calculatedTotalTassato }
          onChange={(e) => onChange({ ...product, taxed_totalprice: e.target.value })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
        />
      </td>
      {/* Asset */}
      <td className="px-4 py-2 whitespace-nowrap">
        <label htmlFor={`asset-${index}`} className="block text-sm font-medium text-gray-700">
          Asset
        </label>
        <input
          type="checkbox"
          id={`asset-${index}`}
          checked={product.asset || false}
          onChange={(e) => onChange({ ...product, asset: e.target.checked })}
          className="h-4 w-4 text-[#7fb7d4]"
        />
      </td>
      {/* Depreciation */}
      <td className="px-4 py-2 whitespace-nowrap">
        <label htmlFor={`depreciation-${index}`} className="block text-sm font-medium text-gray-700">
          Ammortamento
        </label>
        <input
          type="checkbox"
          id={`depreciation-${index}`}
          checked={product.depreciation || false}
          onChange={(e) => onChange({ ...product, depreciation: e.target.checked })}
          className="h-4 w-4 text-[#7fb7d4]"
        />
      </td>
      {/* Depreciation years */}
      <td className="px-4 py-2 whitespace-nowrap">
        <label htmlFor={`depreciation_years-${index}`} className="block text-sm font-medium text-gray-700">
          Anni Ammortamento
        </label>
        <input
          type="number"
          id={`depreciation_years-${index}`}
          value={product.depreciation_years || ''}
          onChange={(e) => onChange({ ...product, depreciation_years: e.target.value })}
          disabled={!product.depreciation}
          className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
        />
      </td>
      {/* Rimuovi */}
      <td className="px-4 py-2 whitespace-nowrap">
        <button
          type="button"
          onClick={handleDeleteClick}
          className="text-blue-500 hover:text-blue-900"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </td>
    </tr>
  );
}
