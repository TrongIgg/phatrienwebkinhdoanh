import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  MapPin,
  Check,
  ChevronRight,
  Pencil,
  AlertCircle,
  Loader2,
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
  const [provinceSearch, setProvinceSearch] = useState('');
  const [wardSearch, setWardSearch] = useState('');

  // Mở picker nếu chưa chọn đủ tỉnh + phường
  const [pickerOpen, setPickerOpen] = useState(() => !value.city || !value.ward);

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

  const filteredProvinces = useMemo(() => {
    const q = provinceSearch.trim().toLowerCase();
    if (!q) return provinces;
    return provinces.filter(
      (p) =>
        p.Name.toLowerCase().includes(q) ||
        p.FullName.toLowerCase().includes(q) ||
        (p.NameEn?.toLowerCase().includes(q) ?? false),
    );
  }, [provinces, provinceSearch]);

  const filteredWards = useMemo(() => {
    if (!selectedProvince) return [];
    const q = wardSearch.trim().toLowerCase();
    if (!q) return selectedProvince.Wards;
    return selectedProvince.Wards.filter(
      (w) =>
        w.Name.toLowerCase().includes(q) ||
        w.FullName.toLowerCase().includes(q),
    );
  }, [selectedProvince, wardSearch]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleProvinceSelect = useCallback(
    (province: Province) => {
      // Reset ward khi đổi tỉnh
      if (value.city !== province.FullName) {
        onChange('ward', '');
        setWardSearch('');
      }
      onChange('city', province.FullName);
    },
    [onChange, value.city],
  );

  const handleWardSelect = useCallback(
    (ward: Ward) => {
      onChange('ward', ward.FullName);
      setPickerOpen(false);
    },
    [onChange],
  );

  const handleEditPicker = () => {
    setPickerOpen(true);
    setProvinceSearch('');
    setWardSearch('');
  };

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
    <div className="space-y-3">

      {/* ── Summary chip — hiện khi đã chọn đủ & picker đóng ─────────────── */}
      {value.city && value.ward && !pickerOpen && (
        <div className="flex items-center justify-between gap-3 rounded-[14px] border border-[#C96B37]/30 bg-[#FFF1E8] px-4 py-3">
          <div className="flex items-start gap-2 min-w-0">
            <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#C96B37]" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#2B211D]">{value.city}</p>
              <p className="truncate text-xs text-[#6E4E3F]">{value.ward}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleEditPicker}
            className="flex flex-shrink-0 items-center gap-1.5 rounded-full border border-[#716942] px-3 py-1.5 text-xs font-bold text-[#716942] transition-colors hover:bg-[#716942] hover:text-white"
          >
            <Pencil className="h-3 w-3" />
            Thay đổi
          </button>
        </div>
      )}

      {/* ── Cascading picker panel ────────────────────────────────────────── */}
      {pickerOpen && (
        <div className="overflow-hidden rounded-[16px] border border-[#E5CDBA] shadow-sm">

          {/* Header */}
          <div className="flex items-center gap-2 border-b border-[#E5CDBA] bg-[#FFF1E8] px-4 py-3">
            <MapPin className="h-4 w-4 flex-shrink-0 text-[#C96B37]" />
            <span className="text-sm font-bold text-[#2B211D]">
              {!value.city
                ? 'Bước 1 — Chọn Tỉnh / Thành phố'
                : !value.ward
                  ? `Bước 2 — Chọn Phường / Xã (${value.city})`
                  : `✓  ${value.city}  ·  ${value.ward}`}
            </span>
            {value.city && value.ward && (
              <button
                type="button"
                onClick={() => setPickerOpen(false)}
                className="ml-auto rounded-full bg-[#716942] px-3 py-1 text-[11px] font-bold text-white hover:bg-[#5d5635] transition-colors"
              >
                Xong ✓
              </button>
            )}
          </div>

          {/* Loading / Error */}
          {loading && (
            <div className="flex items-center justify-center gap-2 py-14 text-sm text-[#999]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Đang tải dữ liệu địa chính...
            </div>
          )}

          {!loading && loadError && (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-[#A33A2F]">
              <AlertCircle className="h-4 w-4" />
              Không tải được dữ liệu. Vui lòng tải lại trang.
            </div>
          )}

          {/* Two-column list panel */}
          {!loading && !loadError && (
            <div className="grid divide-[#EFD8C7] md:grid-cols-2 md:divide-x">

              {/* ── Province column ─────────────────────────────────────── */}
              <div className="flex flex-col border-b border-[#EFD8C7] md:border-b-0" style={{ maxHeight: 340 }}>
                {/* Search */}
                <div className="border-b border-[#EFD8C7] bg-white/70 p-2.5">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#bbb]" />
                    <input
                      value={provinceSearch}
                      onChange={(e) => setProvinceSearch(e.target.value)}
                      placeholder="Tìm tỉnh, thành phố..."
                      className="h-9 w-full rounded-lg border border-[#E5CDBA] bg-white pl-8 pr-3 text-sm outline-none focus:border-[#716942] focus:ring-2 focus:ring-[#716942]/20"
                    />
                  </div>
                </div>
                {/* Province list */}
                <ul className="flex-1 overflow-y-auto overscroll-contain py-1">
                  {filteredProvinces.length === 0 && (
                    <li className="px-4 py-8 text-center text-sm text-[#aaa]">
                      Không tìm thấy kết quả
                    </li>
                  )}
                  {filteredProvinces.map((p) => {
                    const active = value.city === p.FullName;
                    return (
                      <li key={p.Code}>
                        <button
                          type="button"
                          onClick={() => handleProvinceSelect(p)}
                          className={`group flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition-colors ${
                            active
                              ? 'bg-[#F3E2D5] font-semibold text-[#2B211D]'
                              : 'text-[#3C2C25] hover:bg-[#FFF8F2]'
                          }`}
                        >
                          <span className="flex-1 leading-snug">{p.FullName}</span>
                          {active ? (
                            <Check className="h-4 w-4 flex-shrink-0 text-[#C96B37]" />
                          ) : (
                            <ChevronRight className="h-4 w-4 flex-shrink-0 text-[#ccc] opacity-0 transition-opacity group-hover:opacity-100" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* ── Ward column ─────────────────────────────────────────── */}
              <div
                className={`flex flex-col transition-opacity duration-200 ${!selectedProvince ? 'pointer-events-none opacity-40' : 'opacity-100'}`}
                style={{ maxHeight: 340 }}
              >
                {!selectedProvince ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
                    <ChevronRight className="h-8 w-8 text-[#ddd]" />
                    <p className="text-sm text-[#bbb]">Chọn Tỉnh / Thành phố trước</p>
                  </div>
                ) : (
                  <>
                    {/* Search */}
                    <div className="border-b border-[#EFD8C7] bg-white/70 p-2.5">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#bbb]" />
                        <input
                          value={wardSearch}
                          onChange={(e) => setWardSearch(e.target.value)}
                          placeholder={`Tìm trong ${selectedProvince.Name}...`}
                          autoFocus
                          className="h-9 w-full rounded-lg border border-[#E5CDBA] bg-white pl-8 pr-3 text-sm outline-none focus:border-[#716942] focus:ring-2 focus:ring-[#716942]/20"
                        />
                      </div>
                    </div>
                    {/* Ward count badge */}
                    <div className="border-b border-[#EFD8C7] bg-[#FFFBF7] px-4 py-1.5">
                      <span className="text-[11px] text-[#aaa]">
                        {filteredWards.length} phường/xã
                        {wardSearch ? ` phù hợp với "${wardSearch}"` : ` trong ${selectedProvince.Name}`}
                      </span>
                    </div>
                    {/* Ward list */}
                    <ul className="flex-1 overflow-y-auto overscroll-contain py-1">
                      {filteredWards.length === 0 && (
                        <li className="px-4 py-8 text-center text-sm text-[#aaa]">
                          Không tìm thấy kết quả
                        </li>
                      )}
                      {filteredWards.map((w) => {
                        const active = value.ward === w.FullName;
                        return (
                          <li key={w.Code}>
                            <button
                              type="button"
                              onClick={() => handleWardSelect(w)}
                              className={`flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition-colors ${
                                active
                                  ? 'bg-[#F3E2D5] font-semibold text-[#2B211D]'
                                  : 'text-[#3C2C25] hover:bg-[#FFF8F2]'
                              }`}
                            >
                              <span className="flex-1 leading-snug">
                                <span className="mr-1 text-[11px] text-[#bbb]">
                                  {w.AdministrativeUnitShortName}
                                </span>
                                {w.Name}
                              </span>
                              {active && (
                                <Check className="h-4 w-4 flex-shrink-0 text-[#C96B37]" />
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Errors cho city / ward */}
          {(errors.city || errors.ward) && (
            <div className="space-y-1 border-t border-[#EFD8C7] bg-[#FFF8F2] px-5 py-2">
              {errors.city && (
                <p className="flex items-center gap-1.5 text-xs text-[#A33A2F]">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  {errors.city}
                </p>
              )}
              {errors.ward && (
                <p className="flex items-center gap-1.5 text-xs text-[#A33A2F]">
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  {errors.ward}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── District + Address — hiện khi đã chọn tỉnh ───────────────────── */}
      {value.city && (
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Quận/Huyện — nhập tay */}
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
              <p className="mt-1 flex items-center gap-1 text-xs text-[#A33A2F]">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.district}
              </p>
            )}
          </div>

          {/* Số nhà, tên đường */}
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
              <p className="mt-1 flex items-center gap-1 text-xs text-[#A33A2F]">
                <AlertCircle className="h-3.5 w-3.5" />
                {errors.address}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
