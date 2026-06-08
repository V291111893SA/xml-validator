const REQUIRED_FIELDS = [
    'id',
    'owner',
    'number',
    'name',
    'conclusion_date',
    'contract_currency',
    'start_date',
    'end_date',
    'amount',
    'payment_currency',
    'status',
    'contract_term',
];
const DATE_FIELDS = [
    'conclusion_date',
    'start_date',
    'end_date',
    'another_payment_date',
    'act_last_day_of_month_date',
];
const NUMERIC_FIELDS = [
    'amount',
    'contract_debt',
    'overdue_debt',
    'pay_left',
    'another_payment_amount',
    'total_paid_payments',
    'total_amount_paid',
    'next_payment_plus_overdue_dept',
    'total_payments_left_to_pay',
    'total_amount_paid_byn',
    'balance_difference',
    'debt_in_favor_of',
    'total_amount_to_be_received',
    'total_amount_received',
    'debt_in_currency_of_contract',
    'scheduled_payments_sum',
];
const VALID_STATUSES = ['active', 'completed', 'defaulted'];
const VALID_CURRENCIES = ['BYN', 'USD', 'EUR', 'RUB'];
function isValidDate(dateStr) {
    if (!dateStr)
        return false;
    // Empty date markers: 0-00-00, 00-00-00, 0000-00-00
    if (dateStr === '0-00-00' || dateStr === '00-00-00' || dateStr === '0000-00-00')
        return true;
    // ISO format with time zone: 2025-04-11T00:00:00+03:00
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[\+\-]\d{2}:\d{2}$/.test(dateStr)) {
        const date = new Date(dateStr);
        return !isNaN(date.getTime());
    }
    // Simple date format: 2025-04-11 or with 2-digit year: YYYY-MM-DD
    if (/^\d{1,4}-\d{2}-\d{2}$/.test(dateStr)) {
        const date = new Date(dateStr);
        return !isNaN(date.getTime());
    }
    return false;
}
function isValidNumber(value) {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return !isNaN(num) && isFinite(num);
}
function isValidYYYYMMDDDate(dateStr) {
    if (!dateStr)
        return false;
    // Allow 0000-00-00 as special marker
    if (dateStr === '0000-00-00')
        return true;
    // ISO 8601 format: 2025-06-15T00:00:00+03:00
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[\+\-]\d{2}:\d{2}$/.test(dateStr)) {
        const date = new Date(dateStr);
        return !isNaN(date.getTime());
    }
    // Accept YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const date = new Date(dateStr);
        return !isNaN(date.getTime());
    }
    return false;
}
export function validateXML(xmlString) {
    const errors = [];
    const warnings = [];
    // Parse XML
    let root;
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
        if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
            return {
                isValid: false,
                errors: [{ message: 'Ошибка синтаксиса XML', severity: 'error' }],
                warnings: [],
            };
        }
        root = xmlDoc.documentElement;
    }
    catch (e) {
        return {
            isValid: false,
            errors: [{ message: `Ошибка при парсинге XML: ${e instanceof Error ? e.message : String(e)}`, severity: 'error' }],
            warnings: [],
        };
    }
    if (root.nodeName !== 'root') {
        errors.push({ message: 'Корневой элемент должен быть <root>', severity: 'error' });
    }
    // Check required fields
    for (const field of REQUIRED_FIELDS) {
        const element = root.querySelector(field);
        const value = element?.textContent?.trim();
        if (!element || !value) {
            errors.push({ field, message: `Обязательное поле отсутствует или пусто`, severity: 'error' });
        }
    }
    // Validate date fields
    for (const field of DATE_FIELDS) {
        const element = root.querySelector(field);
        if (element) {
            const value = element.textContent?.trim();
            if (value && !isValidDate(value)) {
                errors.push({
                    field,
                    message: `Неверный формат даты. Ожидается YYYY-MM-DD или ISO 8601`,
                    severity: 'error',
                });
            }
        }
    }
    // Validate numeric fields
    for (const field of NUMERIC_FIELDS) {
        const element = root.querySelector(field);
        if (element) {
            const value = element.textContent?.trim();
            if (value && !isValidNumber(value)) {
                errors.push({
                    field,
                    message: `Значение должно быть числом`,
                    severity: 'error',
                });
            }
        }
    }
    // Validate currencies
    for (const field of ['contract_currency', 'payment_currency', 'balance_difference_currency']) {
        const element = root.querySelector(field);
        if (element) {
            const value = element.textContent?.trim();
            if (value && !VALID_CURRENCIES.includes(value)) {
                warnings.push({
                    field,
                    message: `Неизвестная валюта: ${value}`,
                    severity: 'warning',
                });
            }
        }
    }
    // Validate status
    const statusElement = root.querySelector('status');
    if (statusElement) {
        const status = statusElement.textContent?.trim();
        if (status && !VALID_STATUSES.includes(status)) {
            warnings.push({
                field: 'status',
                message: `Неизвестный статус: ${status}`,
                severity: 'warning',
            });
        }
    }
    // Validate schedule structure
    const schedules = root.querySelectorAll('schedule');
    if (schedules.length === 0) {
        errors.push({ message: 'Обязательно наличие минимум одного элемента <schedule>', severity: 'error' });
    }
    else {
        schedules.forEach((schedule, index) => {
            const requiredScheduleFields = ['number', 'type', 'contract_payment_date', 'schedule_payment_amount', 'contract_currency', 'payment_currency'];
            for (const field of requiredScheduleFields) {
                const element = schedule.querySelector(field);
                if (!element) {
                    errors.push({
                        message: `В расписании платежа #${index + 1} отсутствует поле <${field}>`,
                        severity: 'error',
                    });
                }
            }
            // Validate type
            const type = schedule.querySelector('type')?.textContent?.trim();
            if (type && !['lease_payment', 'purchase_price'].includes(type)) {
                errors.push({
                    message: `В расписании платежа #${index + 1} неверный тип: "${type}". Допустимые: lease_payment, purchase_price`,
                    severity: 'error',
                });
            }
            // Validate date format (YYYY-MM-DD)
            const date = schedule.querySelector('contract_payment_date')?.textContent?.trim();
            if (date && !isValidYYYYMMDDDate(date)) {
                errors.push({
                    message: `В расписании платежа #${index + 1} неверный формат даты. Ожидается YYYY-MM-DD`,
                    severity: 'error',
                });
            }
            // Validate amount
            const amount = schedule.querySelector('schedule_payment_amount')?.textContent?.trim();
            if (amount && !isValidNumber(amount)) {
                errors.push({
                    message: `В расписании платежа #${index + 1} сумма должна быть числом`,
                    severity: 'error',
                });
            }
            // Validate currencies
            const contractCurr = schedule.querySelector('contract_currency')?.textContent?.trim();
            if (contractCurr && !['BYN', 'USD', 'EUR', 'RUB'].includes(contractCurr)) {
                errors.push({
                    message: `В расписании платежа #${index + 1} неверная contract_currency: "${contractCurr}"`,
                    severity: 'error',
                });
            }
            const paymentCurr = schedule.querySelector('payment_currency')?.textContent?.trim();
            if (paymentCurr && !['BYN', 'USD', 'EUR', 'RUB'].includes(paymentCurr)) {
                errors.push({
                    message: `В расписании платежа #${index + 1} неверная payment_currency: "${paymentCurr}"`,
                    severity: 'error',
                });
            }
        });
    }
    // Validate payments structure
    const payments = root.querySelectorAll('payments');
    if (payments.length === 0) {
        errors.push({ message: 'Обязательно наличие минимум одного элемента <payments>', severity: 'error' });
    }
    else {
        payments.forEach((payment, index) => {
            const requiredPaymentFields = ['date', 'amount_with_vat', 'payment_currency', 'rate_to_byn', 'amount_byn', 'number_of_days_overdue'];
            for (const field of requiredPaymentFields) {
                const element = payment.querySelector(field);
                if (!element) {
                    errors.push({
                        message: `В платеже #${index + 1} отсутствует поле <${field}>`,
                        severity: 'error',
                    });
                }
            }
            // Validate date format (YYYY-MM-DD)
            const date = payment.querySelector('date')?.textContent?.trim();
            if (date && !isValidYYYYMMDDDate(date)) {
                errors.push({
                    message: `В платеже #${index + 1} неверный формат даты. Ожидается YYYY-MM-DD`,
                    severity: 'error',
                });
            }
            // Validate amount_with_vat
            const amountWithVat = payment.querySelector('amount_with_vat')?.textContent?.trim();
            if (amountWithVat && !isValidNumber(amountWithVat)) {
                errors.push({
                    message: `В платеже #${index + 1} amount_with_vat должна быть числом`,
                    severity: 'error',
                });
            }
            // Validate payment_currency
            const paymentCurr = payment.querySelector('payment_currency')?.textContent?.trim();
            if (paymentCurr && !['BYN', 'USD', 'EUR', 'RUB'].includes(paymentCurr)) {
                errors.push({
                    message: `В платеже #${index + 1} неверная payment_currency: "${paymentCurr}"`,
                    severity: 'error',
                });
            }
            // Validate rate_to_byn (должно быть > 0)
            const rateToByn = payment.querySelector('rate_to_byn')?.textContent?.trim();
            if (rateToByn) {
                const rate = parseFloat(rateToByn);
                if (isNaN(rate) || rate <= 0) {
                    errors.push({
                        message: `В платеже #${index + 1} rate_to_byn должна быть числом больше 0`,
                        severity: 'error',
                    });
                }
            }
            // Validate amount_byn
            const amountByn = payment.querySelector('amount_byn')?.textContent?.trim();
            if (amountByn && !isValidNumber(amountByn)) {
                errors.push({
                    message: `В платеже #${index + 1} amount_byn должна быть числом`,
                    severity: 'error',
                });
            }
            // Validate number_of_days_overdue
            const daysOverdue = payment.querySelector('number_of_days_overdue')?.textContent?.trim();
            if (daysOverdue && !isValidNumber(daysOverdue)) {
                errors.push({
                    message: `В платеже #${index + 1} number_of_days_overdue должна быть числом`,
                    severity: 'error',
                });
            }
        });
    }
    // Check for trailing whitespace in id
    const idElement = root.querySelector('id');
    if (idElement && idElement.textContent !== idElement.textContent?.trim()) {
        warnings.push({
            field: 'id',
            message: 'ID содержит пробелы в конце (пробелы будут обрезаны)',
            severity: 'warning',
        });
    }
    return {
        isValid: errors.length === 0,
        errors,
        warnings,
    };
}
