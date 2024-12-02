import React, { useMemo, useEffect } from 'react';
import Select from 'react-tailwindcss-select';
import { TrashIcon } from '@heroicons/react/20/solid';

export default function PurchaseRowInput({
  product,
  index,
  onChange,
  onRemove,
}) {
  const handleDeleteClick = () => {
    const confirmed = window.confirm('Sei sicuro di voler eliminare questo prodotto?');
    if (confirmed) {
      onRemove(index);
    }
  };

  const Vat = ['22', '10', '4', '0'];
  const Ricorrenza = ['Mensile', 'Annuale', 'Trimestrale', 'Semestrale'];

  // Calcola l'importo IVA inclusa
  const calculateVatIncludedPrice = (taxedUnitPrice, vatRate) => {
    const price = parseFloat(taxedUnitPrice || 0);
    const vat = parseFloat(vatRate || 0);
    return (price * (1 + vat / 100)).toFixed(2);
  };

  // Calcola i totali
  const calculatedTotalTassato = useMemo(() => {
    const taxedUnitPrice = parseFloat(product.unit_price_excl_vat || 0);
    const quantity = parseFloat(product.quantity || 0);
    return (taxedUnitPrice * quantity).toFixed(2);
  }, [product.unit_price_excl_vat, product.quantity]);

  const calculatedTotal = useMemo(() => {
    const unitPrice = parseFloat(product.unit_price || 0);
    const quantity = parseFloat(product.quantity || 0);
    return (unitPrice * quantity).toFixed(2);
  }, [product.unit_price, product.quantity]);

  // Effetto per calcolare automaticamente l'importo IVA inclusa
  useEffect(() => {
    if (product.unit_price_excl_vat && product.vat) {
      const vatIncludedUnitPrice = calculateVatIncludedPrice(product.unit_price_excl_vat, product.vat);
      const calculatedUnitTotal = (parseFloat(vatIncludedUnitPrice) * parseFloat(product.quantity || 1)).toFixed(2);
      
      onChange({
        ...product, 
        unit_price: vatIncludedUnitPrice,
        total: calculatedUnitTotal
      });
    }
    console.log(product);
  }, [product.unit_price_excl_vat, product.vat, product.quantity]);

  return (
    <tr key={index}>
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
        <label htmlFor={`unit_price_excl_vat-${index}`} className="block text-sm font-medium text-gray-700">
          Importo Unitario IVA Esclusa
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-gray-500">€</span>
          <input 
            type="number"
            placeholder='0.00'
            id={`unit_price_excl_vat-${index}`}
            name={`unit_price_excl_vat-${index}`}
            value={product.unit_price_excl_vat}
            onChange={(e) => onChange({ ...product, unit_price_excl_vat: e.target.value })}
            className="block w-full pl-6 rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
          />
        </div>
      </td>
      <td className="px-4 py-2 whitespace-nowrap">
        <label htmlFor={`total_taxed-${index}`} className="block text-sm font-medium text-gray-700">
          Importo Totale IVA Esclusa
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-gray-500">€</span>
          <input
            type="number"
            id={`total_taxed-${index}`}
            name={`total_taxed-${index}`}
            value={product.total_excl_vat || calculatedTotalTassato}
            onChange={(e) => onChange({ ...product, total_taxed: e.target.value })}
            className="block w-full pl-6 rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
            disabled={true}
          />
        </div>
      </td>
      <td className="px-4 py-2 whitespace-nowrap">
        <label htmlFor={`vat-${index}`} className="block text-sm font-medium text-gray-700">
          IVA
        </label>
        <Select
          id={`vat-${index}`}
          name={`vat-${index}`}
          value={product.vat ? { value: product.vat, label: product.vat } : null}
          onChange={(option) => onChange({ ...product, vat: option.value })}
          options={Vat.map(v => ({ value: v, label: v }))}
          placeholder="Seleziona l'IVA"
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:max-w-xs sm:text-sm sm:leading-6"
          primaryColor='[#7fb7d4]'
        />
      </td>
      <td className="px-4 py-2 whitespace-nowrap">
        <label htmlFor={`unit_price-${index}`} className="block text-sm font-medium text-gray-700">
          Importo Unitario IVA Inclusa
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-gray-500">€</span>
          <input
            type="number"
            placeholder='0.00'
            id={`unit_price-${index}`}
            name={`unit_price-${index}`}
            value={product.unit_price}
            onChange={(e) => onChange({ ...product, unit_price: e.target.value })}
            className="block w-full pl-6 rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
          />
        </div>
      </td>
      <td className="px-4 py-2 whitespace-nowrap">
        <label htmlFor={`total-${index}`} className="block text-sm font-medium text-gray-700">
          Importo Totale IVA Inclusa
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-2 flex items-center text-gray-500">€</span>
          <input
            type="number"
            id={`total-${index}`}
            name={`total-${index}`}
            value={product.total || calculatedTotal}
            onChange={(e) => onChange({ ...product, total: e.target.value })}
            className="block w-full pl-6 rounded-md border-gray-300 shadow-sm focus:border-[#7fb7d4] focus:ring-[#7fb7d4] sm:text-sm"
            disabled={true}
          />
        </div>
      </td>
      <td className="px-4 py-2 whitespace-nowrap">
        <label htmlFor={`depreciation-${index}`} className="block text-sm font-medium text-gray-700">
          Ricorrenza
        </label>
        <Select
          id={`recurrence-${index}`}
          name={`recurrence-${index}`}
          value={product.recurrence ? { value: product.recurrence, label: product.recurrence } : null}
          onChange={(option) => onChange({ ...product, recurrence: option.value })}
          options={Ricorrenza.map(r => ({ value: r, label: r }))}
          placeholder="Seleziona la ricorrenza"
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-[#7fb7d4] sm:max-w-xs sm:text-sm sm:leading-6"
          primaryColor='[#7fb7d4]'
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