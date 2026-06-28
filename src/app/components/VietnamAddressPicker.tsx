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
  district: string; // Nhập tay Quận/Huyện (không có trong dữ liệu JSON)
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

  // ── Fetch dữ liệu JSON từ /data/vietnam_units.json ────────────────────────
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

  // ── Derived selections ────────────────────────────────────────────────────
  const selectedProvince = useMemo(
    () => provinces.find((p) => p.FullName === value.city) ?? null,
    [provinces, value.city],
  );

  const filteredWards = useMemo(() => {
    if (!selectedProvince) return [];
    return selectedProvince.Wards;
  }, [selectedProvince]);

  // ─── ReadOnly mode ────────────────────────────────────────────────────────
  if (readOnly) {
    return (
      <div className="rounded-[14px] border border-[#EFD8C7] bg-[#FFF8F2] p-4 text-sm text-[#3C2C25] space-y-1">
        {[
          { label: 'Tỉnh/TP', val: value.city },
          { label: 'Quận/Huyện', val: value.district },
          { label: 'Phường/Xã', val: value.ward },
          { label: 'Địa chỉ', val: value.address },
        ].map(({ label, val }) => (
          <p key={label}>
            <span className="font-semibold text-[#6E4E3F]">{label}:</span>{' '}
            {val || '—'}
          </p>
        ))}
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {/* 1. Tỉnh / Thành phố */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-[#2B211D]">
          Tỉnh / Thành phố <span className="text-red-600">*</span>
        </label>
        <div className="relative">
          <select
            value={value.city}
            onChange={(e) => {
              const val = e.target.value;
              onChange('city', val);
              onChange('ward', ''); // Reset ward when city changes
            }}
            disabled={loading || loadError}
            className={`h-[49px] w-full appearance-none border px-4 pr-10 text-sm outline-none transition-shadow focus:ring-2 focus:ring-[#716942]/30 ${
              errors.city ? 'border-[#A33A2F] bg-[#FFF8F8]' : 'border-[#949494] bg-white'
            } disabled:bg-[#F5F5F5] disabled:text-[#aaa]`}
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
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </div>
        {errors.city && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-[#A33A2F]">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            {errors.city}
          </p>
        )}
      </div>

      {/* 2. Quận / Huyện */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-[#2B211D]">
          Quận / Huyện <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          value={value.district}
          onChange={(e) => onChange('district', e.target.value)}
          placeholder="VD: Quận 1, Huyện Gia Lâm..."
          className={`h-[49px] w-full border px-4 text-sm outline-none transition-shadow focus:ring-2 focus:ring-[#716942]/30 ${
            errors.district ? 'border-[#A33A2F] bg-[#FFF8F8]' : 'border-[#949494] bg-white'
          }`}
        />
        {errors.district && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-[#A33A2F]">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            {errors.district}
          </p>
        )}
      </div>

      {/* 3. Phường / Xã */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-[#2B211D]">
          Phường / Xã <span className="text-red-600">*</span>
        </label>
        <div className="relative">
          <select
            value={value.ward}
            onChange={(e) => onChange('ward', e.target.value)}
            disabled={!value.city || loading || loadError}
            className={`h-[49px] w-full appearance-none border px-4 pr-10 text-sm outline-none transition-shadow focus:ring-2 focus:ring-[#716942]/30 ${
              errors.ward ? 'border-[#A33A2F] bg-[#FFF8F8]' : 'border-[#949494] bg-white'
            } disabled:bg-[#F5F5F5] disabled:text-[#aaa]`}
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
        {errors.ward && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-[#A33A2F]">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            {errors.ward}
          </p>
        )}
      </div>

      {/* 4. Số nhà, tên đường */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-[#2B211D]">
          Số nhà, tên đường <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          value={value.address}
          onChange={(e) => onChange('address', e.target.value)}
          placeholder="VD: 12 Nguyễn Huệ, Khu A..."
          className={`h-[49px] w-full border px-4 text-sm outline-none transition-shadow focus:ring-2 focus:ring-[#716942]/30 ${
            errors.address ? 'border-[#A33A2F] bg-[#FFF8F8]' : 'border-[#949494] bg-white'
          }`}
        />
        {errors.address && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-[#A33A2F]">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            {errors.address}
          </p>
        )}
      </div>
    </div>
  );
}
