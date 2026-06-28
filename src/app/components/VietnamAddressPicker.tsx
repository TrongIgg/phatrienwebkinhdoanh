import { useState, useEffect, useMemo } from 'react';
import {
  AlertCircle,
  Loader2,
  ChevronDown,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type Ward = {
  Code: string;
  Name: string;
  FullName: string;
  NameEn?: string;
  CodeName?: string;
  AdministrativeUnitShortName: string;
};

type Province = {
  Code: string;
  Name: string;
  FullName: string;
  NameEn?: string;
  Wards: Ward[];
};

export type AddressPickerValue = {
  city: string;     // FullName của Tỉnh/TP (vd: "Thành phố Hà Nội")
  district: string; // Giữ cho tương thích địa cũ / đơn đã lưu; mode mới để trống
  ward: string;     // FullName của Phường/Xã (vd: "Phường Ba Đình")
  address: string;  // Địa chỉ chi tiết (số nhà, tên đường)
};

type FieldErrors = Partial<Record<keyof AddressPickerValue, string>>;

interface VietnamAddressPickerProps {
  value: AddressPickerValue;
  errors: FieldErrors;
  onChange: (field: keyof AddressPickerValue, value: string) => void;
  readOnly?: boolean;
}

export function formatAddressLine(value: Pick<AddressPickerValue, 'address' | 'ward' | 'district' | 'city'>) {
  return [value.address, value.ward, value.district, value.city].filter(Boolean).join(', ');
}

const fieldLabelClass = 'mb-1.5 block text-sm font-semibold text-[#2B211D]';
const inputClass = (hasError: boolean) =>
  `h-[49px] w-full border px-4 text-sm outline-none transition-shadow focus:ring-2 focus:ring-[#716942]/30 ${
    hasError ? 'border-[#A33A2F] bg-[#FFF8F8]' : 'border-[#949494] bg-white'
  }`;

function FieldError({ message }: { message: string }) {
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs text-[#A33A2F]">
      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
      {message}
    </p>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function VietnamAddressPicker({
  value,
  errors,
  onChange,
  readOnly = false,
}: VietnamAddressPickerProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/data/vietnam_units.json')
      .then((r) => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then((data: Province[]) => {
        if (!cancelled) {
          setProvinces(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(true);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  const selectedProvince = useMemo(
    () => provinces.find((p) => p.FullName === value.city) ?? null,
    [provinces, value.city],
  );

  const filteredWards = useMemo(() => {
    if (!selectedProvince) return [];
    return selectedProvince.Wards;
  }, [selectedProvince]);

  if (readOnly) {
    const rows = [
      { label: 'Tỉnh/TP', val: value.city },
      { label: 'Phường/Xã', val: value.ward },
      ...(value.district ? [{ label: 'Quận/Huyện', val: value.district }] : []),
      { label: 'Địa chỉ', val: value.address },
    ];
    return (
      <div className="space-y-1 rounded-[14px] border border-[#EFD8C7] bg-[#FFF8F2] p-4 text-sm text-[#3C2C25]">
        {rows.map(({ label, val }) => (
          <p key={label}>
            <span className="font-semibold text-[#6E4E3F]">{label}:</span>{' '}
            {val || '—'}
          </p>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs leading-5 text-[#6E4E3F]">
        Theo đơn vị hành chính mới: Tỉnh/Thành phố → Phường/Xã
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={fieldLabelClass}>
            Tỉnh / Thành phố <span className="text-red-600">*</span>
          </label>
          <div className="relative">
            <select
              value={value.city}
              onChange={(e) => {
                onChange('city', e.target.value);
                onChange('ward', '');
                onChange('district', '');
              }}
              disabled={loading || loadError}
              className={`${inputClass(!!errors.city)} appearance-none pr-10 disabled:bg-[#F5F5F5] disabled:text-[#aaa]`}
            >
              <option value="" disabled>
                {loading ? 'Đang tải...' : loadError ? 'Lỗi tải dữ liệu' : 'Chọn Tỉnh/TP'}
              </option>
              {provinces.map((p) => (
                <option key={p.Code} value={p.FullName}>
                  {p.FullName}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#716942]">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </div>
          {errors.city && <FieldError message={errors.city} />}
        </div>

        <div>
          <label className={fieldLabelClass}>
            Phường / Xã <span className="text-red-600">*</span>
          </label>
          <div className="relative">
            <select
              value={value.ward}
              onChange={(e) => onChange('ward', e.target.value)}
              disabled={!value.city || loading || loadError}
              className={`${inputClass(!!errors.ward)} appearance-none pr-10 disabled:bg-[#F5F5F5] disabled:text-[#aaa]`}
            >
              <option value="" disabled>
                {!value.city ? 'Chọn Tỉnh/TP trước' : 'Chọn Phường/Xã'}
              </option>
              {filteredWards.map((w) => (
                <option key={w.Code} value={w.FullName}>
                  {w.FullName}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#716942]">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
          {errors.ward && <FieldError message={errors.ward} />}
        </div>
      </div>

      <div>
        <label className={fieldLabelClass}>
          Số nhà, tên đường <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          value={value.address}
          onChange={(e) => onChange('address', e.target.value)}
          placeholder="VD: 12 Nguyễn Huệ, Khu A..."
          className={inputClass(!!errors.address)}
        />
        {errors.address && <FieldError message={errors.address} />}
      </div>
    </div>
  );
}
