export const money=value=>`₦${Number(value||0).toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
export const compactMoney=value=>`₦${Number(value||0).toLocaleString('en-NG',{maximumFractionDigits:0})}`;
