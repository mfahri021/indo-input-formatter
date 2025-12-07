// indo-input-formatter.js
// Indo Input Formatter v1.0.0
// Format: phone, npwp, nik, rupiah, otp, pin, rekening, card, plat, tanggal, jam (Indonesia)
// Plus: validate.nik, validate.npwp, validate.phone, validate.plat, validate.rekening

(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.IndoInputFormatter = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    /**
     * Utility: hanya ambil digit.
     * @param {string} value
     * @returns {string}
     */
    function onlyDigits(value) {
        return (value || '').replace(/\D+/g, '');
    }

    // ============================================================
    // DATA: PLATE REGION MAP (PREFIX → WILAYAH)
    // ============================================================

    const PLATE_REGION_MAP = {
        // SUMATERA
        BL: "Aceh",
        BB: "Sumatera Utara (Tapanuli, Sibolga)",
        BK: "Sumatera Utara (Medan, Deli Serdang)",
        BA: "Sumatera Barat",
        BM: "Riau",
        BP: "Kepulauan Riau",
        BG: "Sumatera Selatan (Palembang)",
        BN: "Bangka Belitung",
        BE: "Lampung",

        // JAWA (BARAT, TENGAH, TIMUR) & SEKITAR
        B: "DKI Jakarta, Depok, Tangerang, Bekasi",
        D: "Bandung, Cimahi",
        F: "Bogor, Sukabumi, Cianjur",
        E: "Cirebon, Indramayu, Majalengka",
        T: "Purwakarta, Subang, Karawang",
        Z: "Garut, Tasikmalaya, Ciamis",

        G: "Tegal, Pekalongan, Brebes",
        H: "Semarang, Salatiga",
        K: "Pati, Kudus, Jepara",
        R: "Banyumas, Cilacap",
        AA: "Magelang, Temanggung",
        AB: "DI Yogyakarta",
        AD: "Surakarta (Solo), Sragen",
        AE: "Madiun, Ngawi",
        AG: "Kediri, Blitar",
        L: "Surabaya",
        M: "Madura",
        N: "Malang, Pasuruan",
        P: "Jember, Banyuwangi",
        S: "Bojonegoro",
        W: "Sidoarjo, Gresik",

        // BALI & NUSA TENGGARA
        DK: "Bali",
        DR: "Lombok (NTB)",
        EA: "Sumbawa, Bima (NTB)",

        // KALIMANTAN
        DA: "Kalimantan Selatan",
        KH: "Kalimantan Tengah",
        KT: "Kalimantan Timur",
        KU: "Kalimantan Utara",
        KB: "Kalimantan Barat",

        // SULAWESI
        DB: "Sulawesi Utara (Manado)",
        DL: "Kep. Sangihe Talaud",
        DM: "Gorontalo",
        DN: "Sulawesi Tengah (Palu)",
        DD: "Sulawesi Selatan (Makassar)",
        DC: "Sulawesi Barat (Mamuju)",
        DT: "Sulawesi Tenggara (Kendari)",

        // MALUKU & PAPUA
        DE: "Maluku",
        DG: "Maluku Utara",
        PA: "Papua",
        PB: "Papua Barat"
    };

    const VALID_PLATE_PREFIXES = Object.keys(PLATE_REGION_MAP);

    // ============================================================
    // DATA: BANK RULES (NAMA BANK & KODE TRANSFER)
    // ============================================================
    const BANK_RULES = {
        // BANK BESAR NASIONAL
        '002': { code: '002', name: 'Bank Rakyat Indonesia (BRI)', alias: ['BRI'], lengths: null },
        '008': { code: '008', name: 'Bank Mandiri', alias: ['MANDIRI'], lengths: null },
        '009': { code: '009', name: 'Bank Negara Indonesia (BNI)', alias: ['BNI'], lengths: null },
        '014': { code: '014', name: 'Bank Central Asia (BCA)', alias: ['BCA'], lengths: null },
        '200': { code: '200', name: 'Bank Tabungan Negara (BTN)', alias: ['BTN'], lengths: null },

        // BANK SYARIAH UTAMA
        '451': { code: '451', name: 'Bank Syariah Indonesia (eks Mandiri Syariah)', alias: ['BSI', 'MANDIRI SYARIAH'], lengths: null },
        '427': { code: '427', name: 'Bank Syariah Indonesia (eks BNI Syariah)', alias: ['BSI', 'BNI SYARIAH'], lengths: null },
        '422': { code: '422', name: 'Bank Syariah Indonesia (eks BRI Syariah)', alias: ['BSI', 'BRI SYARIAH'], lengths: null },
        '147': { code: '147', name: 'Bank Muamalat', alias: ['MUAMALAT'], lengths: null },

        // BANK SWASTA NASIONAL
        '011': { code: '011', name: 'Bank Danamon', alias: ['DANAMON'], lengths: null },
        '013': { code: '013', name: 'Permata Bank', alias: ['PERMATA'], lengths: null },
        '016': { code: '016', name: 'Bank Maybank Indonesia', alias: ['MAYBANK', 'BII'], lengths: null },
        '019': { code: '019', name: 'Bank Panin', alias: ['PANIN'], lengths: null },
        '022': { code: '022', name: 'Bank CIMB Niaga', alias: ['CIMB', 'CIMB NIAGA'], lengths: null },
        '023': { code: '023', name: 'Bank UOB Indonesia', alias: ['UOB'], lengths: null },
        '028': { code: '028', name: 'Bank OCBC NISP', alias: ['OCBC', 'NISP'], lengths: null },
        '046': { code: '046', name: 'Bank DBS Indonesia', alias: ['DBS'], lengths: null },
        '050': { code: '050', name: 'Standard Chartered Bank', alias: ['SCB'], lengths: null },
        '054': { code: '054', name: 'Bank Capital Indonesia', alias: ['CAPITAL'], lengths: null },
        '087': { code: '087', name: 'Bank HSBC Indonesia', alias: ['HSBC'], lengths: null },

        // DIGITAL / NEO BANK / KONSUMEN
        '213': { code: '213', name: 'Bank BTPN / Jenius', alias: ['BTPN', 'JENIUS'], lengths: null },
        '490': { code: '490', name: 'Bank Neo Commerce', alias: ['NEO'], lengths: null },
        '535': { code: '535', name: 'Bank Seabank Indonesia', alias: ['SEABANK'], lengths: null },
        '536': { code: '536', name: 'Bank Jago', alias: ['JAGO'], lengths: null },
        '947': { code: '947', name: 'Bank Motion Digital', alias: ['MOTION'], lengths: null },

        // BPD (contoh; bisa ditambah sesuai kebutuhan)
        '110': { code: '110', name: 'Bank BPD DIY', alias: ['BPD DIY'], lengths: null },
        '111': { code: '111', name: 'Bank BPD Jawa Tengah', alias: ['BPD JATENG'], lengths: null },
        '112': { code: '112', name: 'Bank BPD Jawa Timur', alias: ['BPD JATIM'], lengths: null },
        '113': { code: '113', name: 'Bank BPD Jawa Barat dan Banten (BJB)', alias: ['BJB'], lengths: null },
        '115': { code: '115', name: 'Bank BPD Jambi', alias: ['BPD JAMBI'], lengths: null },
        '116': { code: '116', name: 'Bank BPD Aceh', alias: ['BPD ACEH'], lengths: null },
        '117': { code: '117', name: 'Bank BPD Sumatera Utara', alias: ['BPD SUMUT'], lengths: null },
        '118': { code: '118', name: 'Bank BPD Sumatera Barat', alias: ['BPD SUMBAR'], lengths: null },
        '119': { code: '119', name: 'Bank BPD Riau dan Kepri', alias: ['BPD RIAU KEPRI'], lengths: null },
        '120': { code: '120', name: 'Bank BPD Sumatera Selatan dan Bangka Belitung', alias: ['BPD SUMSEL BABEL'], lengths: null },
        '121': { code: '121', name: 'Bank BPD Lampung', alias: ['BPD LAMPUNG'], lengths: null },
        '122': { code: '122', name: 'Bank BPD Kalimantan Selatan', alias: ['BPD KALSEL'], lengths: null },
        '123': { code: '123', name: 'Bank BPD Kalimantan Tengah', alias: ['BPD KALTENG'], lengths: null },
        '124': { code: '124', name: 'Bank BPD Kalimantan Barat', alias: ['BPD KALBAR'], lengths: null },
        '125': { code: '125', name: 'Bank BPD Kalimantan Timur dan Utara', alias: ['BPD KALTIM KALTARA'], lengths: null },
        '126': { code: '126', name: 'Bank BPD Sulawesi Selatan dan Barat', alias: ['BPD SULSELBAR'], lengths: null },
        '127': { code: '127', name: 'Bank BPD Sulawesi Utara dan Gorontalo', alias: ['BPD SULUTGO'], lengths: null },
        '128': { code: '128', name: 'Bank BPD Sulawesi Tengah', alias: ['BPD SULTENG'], lengths: null },
        '129': { code: '129', name: 'Bank BPD Sulawesi Tenggara', alias: ['BPD SULTRA'], lengths: null },
        '130': { code: '130', name: 'Bank BPD Maluku dan Maluku Utara', alias: ['BPD MALUKU'], lengths: null },
        '131': { code: '131', name: 'Bank BPD Papua', alias: ['BPD PAPUA'], lengths: null },
        '132': { code: '132', name: 'Bank BPD Nusa Tenggara Barat', alias: ['BPD NTB'], lengths: null },
        '133': { code: '133', name: 'Bank BPD Nusa Tenggara Timur', alias: ['BPD NTT'], lengths: null },

        // Beberapa bank lain
        '089': { code: '089', name: 'Bank BII Maybank (legacy code)', alias: ['BII'], lengths: null },
        '441': { code: '441', name: 'Bank Mega', alias: ['MEGA'], lengths: null },
        '547': { code: '547', name: 'Bank BCA Syariah', alias: ['BCA SYARIAH'], lengths: null }
    };

    // ============================================================
    // FORMATTER FUNCTIONS
    // ============================================================

    function formatPhone(value) {
        let digits = onlyDigits(value);
        if (!digits) return '';

        if (digits.startsWith('62')) {
            digits = '0' + digits.slice(2);
        }

        if (digits.length > 14) {
            digits = digits.slice(0, 14);
        }

        const parts = [];
        while (digits.length > 0) {
            if (parts.length === 0) {
                parts.push(digits.slice(0, 4));
                digits = digits.slice(4);
            } else {
                parts.push(digits.slice(0, 4));
                digits = digits.slice(4);
            }
        }

        return parts.join('-');
    }

    function formatNPWP(value) {
        let digits = onlyDigits(value);
        if (!digits) return '';

        if (digits.length > 15) {
            digits = digits.slice(0, 15);
        }

        const seg = [];
        const pattern = [2, 3, 3, 1, 3, 3];
        let index = 0;

        for (let i = 0; i < pattern.length; i++) {
            const len = pattern[i];
            const part = digits.slice(index, index + len);
            if (!part) break;
            seg.push(part);
            index += len;
        }

        let result = '';
        if (seg[0]) result += seg[0];
        if (seg[1]) result += '.' + seg[1];
        if (seg[2]) result += '.' + seg[2];
        if (seg[3]) result += '.' + seg[3];
        if (seg[4]) result += '-' + seg[4];
        if (seg[5]) result += '.' + seg[5];

        return result;
    }

    function formatNIK(value) {
        let digits = onlyDigits(value);
        if (!digits) return '';

        if (digits.length > 16) {
            digits = digits.slice(0, 16);
        }

        const parts = [];
        for (let i = 0; i < digits.length; i += 4) {
            parts.push(digits.slice(i, i + 4));
        }
        return parts.join(' ');
    }

    function formatRupiah(value) {
        let digits = onlyDigits(value);
        if (!digits) return '';

        digits = digits.replace(/^0+/, '');
        if (digits === '') digits = '0';

        const reversed = digits.split('').reverse().join('');
        const grouped = reversed.match(/\d{1,3}/g).join('.');
        return grouped.split('').reverse().join('');
    }

    function formatOTP(value, length) {
        let digits = onlyDigits(value);
        const maxLen = typeof length === 'number' && length > 0 ? length : 6;
        if (digits.length > maxLen) {
            digits = digits.slice(0, maxLen);
        }
        return digits;
    }

    function formatPIN(value, length) {
        return formatOTP(value, length || 6);
    }

    function formatRekening(value) {
        let digits = onlyDigits(value);
        if (!digits) return '';

        if (digits.length > 20) {
            digits = digits.slice(0, 20);
        }

        const parts = [];
        while (digits.length > 0) {
            parts.push(digits.slice(0, 4));
            digits = digits.slice(4);
        }
        return parts.join(' ');
    }

    function formatCard(value) {
        let digits = onlyDigits(value);
        if (!digits) return '';

        if (digits.length > 16) {
            digits = digits.slice(0, 16);
        }

        const parts = [];
        while (digits.length > 0) {
            parts.push(digits.slice(0, 4));
            digits = digits.slice(4);
        }
        return parts.join(' ');
    }

    /**
     * Format plat nomor (STRICT):
     * - 1–2 huruf depan (prefix wilayah)
     * - 1–4 angka
     * - 0–3 huruf belakang
     */
    function formatPlat(value) {
        let v = (value || '').toUpperCase();
        v = v.replace(/[^A-Z0-9]/g, '');

        const prefixMatch = v.match(/^[A-Z]{1,2}/);
        const prefix = prefixMatch ? prefixMatch[0] : '';
        v = v.slice(prefix.length);

        const numberMatch = v.match(/^\d{1,4}/);
        const number = numberMatch ? numberMatch[0] : '';
        v = v.slice(number.length);

        const suffixMatch = v.match(/^[A-Z]{0,3}/);
        const suffix = suffixMatch ? suffixMatch[0] : '';

        let result = prefix;
        if (number) result += ' ' + number;
        if (suffix) result += ' ' + suffix;

        return result.trim();
    }

    function formatTanggal(value) {
        let digits = onlyDigits(value);
        if (!digits) return '';

        if (digits.length > 8) {
            digits = digits.slice(0, 8);
        }

        if (digits.length <= 2) {
            return digits;
        } else if (digits.length <= 4) {
            return digits.slice(0, 2) + '-' + digits.slice(2);
        } else {
            const dd = digits.slice(0, 2);
            const mm = digits.slice(2, 4);
            const yyyy = digits.slice(4);
            return dd + '-' + mm + '-' + yyyy;
        }
    }

    function formatJam(value) {
        let digits = onlyDigits(value);
        if (!digits) return '';

        if (digits.length > 4) {
            digits = digits.slice(0, 4);
        }

        if (digits.length <= 2) {
            return digits;
        } else {
            const hh = digits.slice(0, 2);
            const mm = digits.slice(2);
            return hh + ':' + mm;
        }
    }

    // ============================================================
    // VALIDATORS
    // ============================================================

    function validateNIK(value) {
        const nik = onlyDigits(value);
        if (nik.length !== 16) return false;

        const dayPart = parseInt(nik.slice(6, 8), 10);
        const month = parseInt(nik.slice(8, 10), 10);

        if (Number.isNaN(dayPart) || Number.isNaN(month)) return false;
        if (month < 1 || month > 12) return false;

        const day = dayPart > 40 ? dayPart - 40 : dayPart;
        if (day < 1 || day > 31) return false;

        return true;
    }

    function validateNPWP(value) {
        const digits = onlyDigits(value);
        return digits.length === 15;
    }

    function validatePhone(value) {
        let digits = onlyDigits(value);
        if (!digits) return false;

        if (digits.startsWith('62')) {
            digits = '0' + digits.slice(2);
        }

        if (!digits.startsWith('0')) return false;
        return digits.length >= 9 && digits.length <= 14;
    }

    function validatePlat(value) {
        const v = (value || '').toUpperCase().trim();
        const match = v.match(/^([A-Z]{1,2}) (\d{1,4}) ([A-Z]{1,3})$/);
        if (!match) return false;

        const prefix = match[1];
        return VALID_PLATE_PREFIXES.includes(prefix);
    }

    function validateRekening(value, bankCodeOrAlias) {
        const digits = onlyDigits(value);
        if (!digits) return false;

        const len = digits.length;

        if (!bankCodeOrAlias) {
            return len >= 6 && len <= 20;
        }

        const key = String(bankCodeOrAlias).toUpperCase().trim();
        let rule = BANK_RULES[key];

        if (!rule) {
            const allKeys = Object.keys(BANK_RULES);
            for (let i = 0; i < allKeys.length; i++) {
                const r = BANK_RULES[allKeys[i]];
                if (r.alias && r.alias.includes(key)) {
                    rule = r;
                    break;
                }
            }
        }

        if (!rule) {
            return len >= 6 && len <= 20;
        }

        if (Array.isArray(rule.lengths) && rule.lengths.length > 0) {
            return rule.lengths.includes(len);
        }

        return len >= 6 && len <= 20;
    }

    // ============================================================
    // MAIN CLASS
    // ============================================================

    class IndoInputFormatter {
        /**
         * Format satu nilai berdasarkan tipe.
         * @param {'phone'|'npwp'|'nik'|'rupiah'|'otp'|'pin'|'rekening'|'card'|'plat'|'tanggal'|'jam'} type
         * @param {string} value
         * @param {HTMLInputElement} [input]
         * @returns {string}
         */
        static format(type, value, input) {
            switch (type) {
                case 'phone':
                    return formatPhone(value);
                case 'npwp':
                    return formatNPWP(value);
                case 'nik':
                    return formatNIK(value);
                case 'rupiah':
                    return formatRupiah(value);
                case 'otp': {
                    let len = 6;
                    if (input && input.dataset.indoOtpLength) {
                        const parsed = parseInt(input.dataset.indoOtpLength, 10);
                        if (!Number.isNaN(parsed) && parsed > 0) len = parsed;
                    }
                    return formatOTP(value, len);
                }
                case 'pin': {
                    let len = 6;
                    if (input && input.dataset.indoPinLength) {
                        const parsed = parseInt(input.dataset.indoPinLength, 10);
                        if (!Number.isNaN(parsed) && parsed > 0) len = parsed;
                    }
                    return formatPIN(value, len);
                }
                case 'rekening':
                    return formatRekening(value);
                case 'card':
                    return formatCard(value);
                case 'plat':
                    return formatPlat(value);
                case 'tanggal':
                    return formatTanggal(value);
                case 'jam':
                    return formatJam(value);
                default:
                    return value || '';
            }
        }

        static attachTo(input, type) {
            if (!input) return;
            if (!type) type = input.dataset.indoFormat;
            if (!type) return;

            input.value = IndoInputFormatter.format(type, input.value, input);

            input.addEventListener('input', function () {
                const formatted = IndoInputFormatter.format(type, input.value, input);
                input.value = formatted;
            });

            input.addEventListener('blur', function () {
                const formatted = IndoInputFormatter.format(type, input.value, input);
                input.value = formatted;
            });
        }

        static autoInit(root) {
            const scope = root || document;
            const elements = scope.querySelectorAll('input[data-indo-format]');
            elements.forEach((el) => {
                const type = el.dataset.indoFormat;
                IndoInputFormatter.attachTo(el, type);
            });
        }

        static getRawValue(input) {
            if (!input) return '';
            return onlyDigits(input.value);
        }

        /**
         * Helper: ambil nama wilayah dari plat.
         * @param {string} value - misal "BG 1234 FA"
         * @returns {string|null}
         */
        static getPlateRegion(value) {
            const v = (value || '').toUpperCase().trim();
            const match = v.match(/^([A-Z]{1,2}) /);
            if (!match) return null;
            const prefix = match[1];
            return PLATE_REGION_MAP[prefix] || null;
        }
    }

    // Helper internal (opsional untuk advanced usage)
    IndoInputFormatter._internal = {
        onlyDigits,
        formatPhone,
        formatNPWP,
        formatNIK,
        formatRupiah,
        formatOTP,
        formatPIN,
        formatRekening,
        formatCard,
        formatPlat,
        formatTanggal,
        formatJam
    };

    // Expose data agar bisa dipakai di UI (select, tabel, dsb)
    IndoInputFormatter.data = {
        platePrefixes: VALID_PLATE_PREFIXES,
        plateMap: PLATE_REGION_MAP,
        banks: BANK_RULES
    };

    // Helper validasi
    IndoInputFormatter.validate = {
        nik: validateNIK,
        npwp: validateNPWP,
        phone: validatePhone,
        plat: validatePlat,
        rekening: validateRekening
    };

    return IndoInputFormatter;
}));
