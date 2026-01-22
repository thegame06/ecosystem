// Enums matching backend exactly (numeric values)
export enum CommercialState {
    LEAD = 1,
    SALE_CREATED = 2,
    INVOICED = 3,
    PAID = 4
}

export enum ProductType {
    Tangible = 1,
    Service = 2,
    Rentable = 3
}

export enum PlanType {
    Starter = 0,
    Pro = 1,
    Growth = 2
}

export enum InvoiceStatus {
    Draft = 0,
    Issued = 1,
    Sent = 2,
    Paid = 3,
    Cancelled = 4
}

// Translation labels
export const COMMERCIAL_STATE_LABELS: Record<CommercialState, string> = {
    [CommercialState.LEAD]: 'Nuevo Lead',
    [CommercialState.SALE_CREATED]: 'Venta Creada',
    [CommercialState.INVOICED]: 'Facturado',
    [CommercialState.PAID]: 'Pagado'
};

export const COMMERCIAL_STATE_COLORS: Record<CommercialState, string> = {
    [CommercialState.LEAD]: 'bg-blue-100 text-blue-700 border-blue-200',
    [CommercialState.SALE_CREATED]: 'bg-amber-100 text-amber-700 border-amber-200',
    [CommercialState.INVOICED]: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    [CommercialState.PAID]: 'bg-emerald-100 text-emerald-700 border-emerald-200'
};

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
    [ProductType.Tangible]: 'Producto',
    [ProductType.Service]: 'Servicio',
    [ProductType.Rentable]: 'Renta'
};

export const PLAN_TYPE_LABELS: Record<PlanType, string> = {
    [PlanType.Starter]: 'Starter',
    [PlanType.Pro]: 'Pro',
    [PlanType.Growth]: 'Growth'
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
    [InvoiceStatus.Draft]: 'Borrador',
    [InvoiceStatus.Issued]: 'Emitida',
    [InvoiceStatus.Sent]: 'Enviada',
    [InvoiceStatus.Paid]: 'Pagada',
    [InvoiceStatus.Cancelled]: 'Cancelada'
};

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
    [InvoiceStatus.Draft]: 'bg-slate-100 text-slate-700',
    [InvoiceStatus.Issued]: 'bg-blue-100 text-blue-700',
    [InvoiceStatus.Sent]: 'bg-indigo-100 text-indigo-700',
    [InvoiceStatus.Paid]: 'bg-emerald-100 text-emerald-700',
    [InvoiceStatus.Cancelled]: 'bg-red-100 text-red-700'
};

export enum PaymentMethod {
    Cash = 1,
    Transfer = 2,
    Card = 3
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
    [PaymentMethod.Cash]: 'Efectivo',
    [PaymentMethod.Transfer]: 'Transferencia',
    [PaymentMethod.Card]: 'Tarjeta'
};
