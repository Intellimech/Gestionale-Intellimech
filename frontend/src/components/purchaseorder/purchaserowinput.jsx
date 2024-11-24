import React from 'react';
import Select from 'react-tailwindcss-select';
import { TrashIcon } from '@heroicons/react/20/solid';

export default function PurchaseRowInput({
  product,
  index,
  categories,
  subcategories,
  onChange,
  onRemove,
  handleCategoryChange
}) {
  const handleDeleteClick = () => {
    const confirmed = window.confirm('Sei sicuro di voler eliminare questo prodotto?');
    if (confirmed) {
      onRemove(index);
    }
  };

  return (
    <tr key={index}>
      <td className="px-4 py-2 whitespace-nowrap">
        <label htmlFor={`category-${index}`} className="block text-sm font-medium text-gray-700">
          Categoria
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
            handleCategoryChange({ target: { value: option.value } });
            onChange({ ...product, category: option.value });
          }}
          options={categories.map(c => ({ value: c.id_category, label: c.name }))}
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:max-w-xs sm:text-sm sm:leading-6"
          primaryColor='[#7fb7d4]'
        />
      </td>

      <td className="px-4 py-2 whitespace-nowrap">
        <label htmlFor={`subcategory-${index}`} className="block text-sm font-medium text-gray-700">
          Sottocategoria
        </label>
        <Select
          id={`subcategory-${index}`}
          name={`subcategory-${index}`}
          value={
            product.subcategory
              ? { value: product.subcategory, label: subcategories.find(s => s.id_subcategory === product.subcategory)?.name }
              : null
          }
          onChange={(option) => onChange({ ...product, subcategory: option.value })}
          options={subcategories.map(s => ({ value: s.id_subcategory, label: s.name }))}
          placeholder="Seleziona una sottocategoria"
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:max-w-xs sm:text-sm sm:leading-6"
          isDisabled={subcategories.length === 0}
          primaryColor='[#7fb7d4]'
        />
      </td>

      <td className="px-4 py-1 whitespace-nowrap">
        <label htmlFor={`description-${index}`} className="block text-sm font-medium text-gray-700">
          Descrizione
        </label>
        <textarea
          id={`description-${index}`}
          name={`description-${index}`}
          value={product.description}
          onChange={(e) => onChange({ ...product, description: e.target.value })}
          rows={1}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">Massimo 150 caratteri</p>
      </td>

      <td className="px-4 py-2 whitespace-nowrap">
        <label htmlFor={`unit_price-${index}`} className="block text-sm font-medium text-gray-700">
          Prezzo Unitario
        </label>
        <input
          type="number"
          placeholder='0.00'
          id={`unit_price-${index}`}
          name={`unit_price-${index}`}
          value={product.unit_price}
          onChange={(e) => onChange({ ...product, unit_price: e.target.value })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
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
          value={product.quantity}
          onChange={(e) => onChange({ ...product, quantity: e.target.value })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
        />
      </td>

      <td className="px-4 py-2 whitespace-nowrap">
        <label htmlFor={`asset-${index}`} className="block text-sm font-medium text-gray-700">
          Asset
        </label>
        <input
          type="checkbox"
          id={`asset-${index}`}
          name={`asset-${index}`}
          checked={product.asset || false}
          onChange={(e) => onChange({ ...product, asset: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300 text-[#7fb7d4] focus:ring-[#7fb7d4]"
        />
      </td>

      <td className="px-4 py-2 whitespace-nowrap">
        <label htmlFor={`depreciation-${index}`} className="block text-sm font-medium text-gray-700">
          Ammortamento
        </label>
        <input
          type="checkbox"
          id={`depreciation-${index}`}
          name={`depreciation-${index}`}
          checked={product.depreciation || false}
          onChange={(e) => onChange({ ...product, depreciation: e.target.checked })}
          className="h-4 w-4 rounded border-gray-300 text-[#7fb7d4] focus:ring-[#7fb7d4]"
        />
      </td>

      <td className="px-4 py-2 whitespace-nowrap">
        <label htmlFor={`depreciation_years-${index}`} className="block text-sm font-medium text-gray-700">
          Anni Ammortamento
        </label>
        <input
          type="number"
          id={`depreciation_years-${index}`}
          name={`depreciation_years-${index}`}
          value={product.depreciation_years || ''}
          onChange={(e) => onChange({ ...product, depreciation_years: e.target.value })}
          disabled={!product.depreciation}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </td>

      <td className="px-4 py-2 whitespace-nowrap">
        <div className="flex flex-col items-start">
          <label className="text-sm font-medium text-gray-700 mb-1">Rimuovi</label>
          <button
            type="button"
            onClick={handleDeleteClick}
            className="text-blue-500 hover:text-blue-900 mt-1 flex items-center"
          >
            <TrashIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </td>
    </tr>
  );
}