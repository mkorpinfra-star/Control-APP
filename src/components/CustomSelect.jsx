import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { IconCheck, IconChevronDown, IconBuildingFactory2 } from '@tabler/icons-react';

export default function CustomSelect({ value, onChange, options, label, count }) {
    const selectedOption = options.find(opt => opt.value === value) || options[0];

    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium mb-1.5 text-gray-700">
                    {label} {count > 0 && <span className="text-xs text-gray-500">({count} obras)</span>}
                </label>
            )}
            <Listbox value={value} onChange={onChange}>
                <div className="relative">
                    <Listbox.Button className="relative w-full px-4 py-3 bg-[#F5F5F5] border-0 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#CE0201] font-medium text-base cursor-pointer hover:bg-gray-100 transition-colors text-left">
                        <span className="flex items-center gap-2">
                            <IconBuildingFactory2 stroke={1} size={18} className="text-gray-600" />
                            <span className="block truncate">{selectedOption.label}</span>
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <IconChevronDown
                                stroke={1}
                                size={20}
                                className="text-[#CE0201]"
                                aria-hidden="true"
                            />
                        </span>
                    </Listbox.Button>
                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                            {options.map((option) => (
                                <Listbox.Option
                                    key={option.value}
                                    value={option.value}
                                    disabled={option.disabled}
                                    className={({ active }) =>
                                        `relative cursor-pointer select-none py-3 pl-10 pr-4 ${
                                            active ? 'bg-[#F5F5F5]' : 'text-gray-900'
                                        } ${option.disabled ? 'opacity-50 cursor-not-allowed' : ''}`
                                    }
                                >
                                    {({ selected, active }) => (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <Building2
                                                    size={16}
                                                    className={selected ? 'text-[#CE0201]' : 'text-gray-400'}
                                                    strokeWidth={2}
                                                />
                                                <span className={`block truncate ${selected ? 'font-bold text-gray-900' : 'font-medium'}`}>
                                                    {option.label}
                                                </span>
                                            </div>
                                            {selected ? (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#CE0201]">
                                                    <IconCheck stroke={1} size={18} aria-hidden="true" />
                                                </span>
                                            ) : null}
                                        </>
                                    )}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </Transition>
                </div>
            </Listbox>
        </div>
    );
}
