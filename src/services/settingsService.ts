/**
 * 매장/타석 설정 관리 서비스
 * localStorage를 사용하여 영구 저장 (업데이트 후에도 유지)
 */

const SHOP_ID_KEY = 'gts_shop_id';
const PCID_KEY = 'gts_pcid';
const ADMIN_PASSWORD_KEY = 'gts_admin_password';
const DEFAULT_PASSWORD = '999999';

export interface ShopSettings {
  shop_id: number | null;
  pcid: string | null;
}

/**
 * 관리자 비밀번호 확인
 */
export function verifyAdminPassword(password: string): boolean {
  const storedPassword = localStorage.getItem(ADMIN_PASSWORD_KEY);
  const actualPassword = storedPassword || DEFAULT_PASSWORD;
  return password === actualPassword;
}

/**
 * 관리자 비밀번호 변경
 */
export function setAdminPassword(newPassword: string): void {
  localStorage.setItem(ADMIN_PASSWORD_KEY, newPassword);
}

/**
 * 관리자 비밀번호 초기화 (기본값으로)
 */
export function resetAdminPassword(): void {
  localStorage.removeItem(ADMIN_PASSWORD_KEY);
}

/**
 * 매장 ID 저장
 */
export function setShopId(shopId: number): void {
  localStorage.setItem(SHOP_ID_KEY, shopId.toString());
}

/**
 * 매장 ID 가져오기
 */
export function getShopId(): number | null {
  const value = localStorage.getItem(SHOP_ID_KEY);
  return value ? parseInt(value, 10) : null;
}

/**
 * PC ID 저장
 */
export function setPcId(pcId: string): void {
  localStorage.setItem(PCID_KEY, pcId);
}

/**
 * PC ID 가져오기
 */
export function getPcId(): string | null {
  return localStorage.getItem(PCID_KEY);
}

/**
 * 전체 설정 가져오기
 */
export function getShopSettings(): ShopSettings {
  return {
    shop_id: getShopId(),
    pcid: getPcId(),
  };
}

/**
 * 전체 설정 저장
 */
export function saveShopSettings(settings: ShopSettings): void {
  if (settings.shop_id !== null) {
    setShopId(settings.shop_id);
  }
  if (settings.pcid !== null) {
    setPcId(settings.pcid);
  }
}

/**
 * 설정이 완료되었는지 확인
 */
export function isShopSettingsConfigured(): boolean {
  return getShopId() !== null && getPcId() !== null;
}

/**
 * 설정 초기화 (주의: 업데이트 시에도 유지되므로 주의 필요)
 */
export function clearShopSettings(): void {
  localStorage.removeItem(SHOP_ID_KEY);
  localStorage.removeItem(PCID_KEY);
}
