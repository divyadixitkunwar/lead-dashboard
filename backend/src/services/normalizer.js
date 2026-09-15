
const variantMap = {
    'kati': ['kati', 'katy', 'katii', 'katti', 'k4ti', 'ktai', 'koti'],
    'paisa': ['paisa', 'paise', 'paysa', 'paissa', 'pesa', 'pessa'],
    'dam': ['dam', 'daam', 'daaam', 'daam'],
    'price': ['price', 'praice', 'prise', 'prce', 'priice'],
    'cost': ['cost', 'cozt', 'kost'],
    'rate': ['rate', 'rait', 'raate', 'ret'],
    'kitna': ['kitna', 'kitana', 'kitna', 'kitnaa'],

    'delivery': ['delivery', 'delivry', 'deliveri', 'delibhry', 'delvry', 'delivary'],
    'pathako': ['pathako', 'pathako', 'pathako', 'pathayo', 'pathaiyo'],
    'pathau': ['pathau', 'pathaw', 'pathaau', 'pathaunu', 'pathaideu'],
    'aaucha': ['aaucha', 'aucha', 'aauchha', 'auchha', 'awcha'],
    'pugcha': ['pugcha', 'pugchha', 'puchha', 'pugchaa', 'poochha'],
    'katiko': ['katiko', 'kati ko', 'katiko', 'katiho'],
    'din': ['din', 'deen', 'dinn', 'days'],
    'location': ['location', 'lokesion', 'lokation', 'lokasyon'],

    'stock': ['stock', 'stok', 'stoock', 'sttock', 'istok'],
    'cha': ['cha', 'chha', 'chaa', 'chhaa', 'xa', 'xha'],
    'chaina': ['chaina', 'chaena', 'chena', 'xaina', 'chaiena', 'chhaina'],
    'available': ['available', 'avilable', 'availble', 'availabel', 'awailable'],
    'baaki': ['baaki', 'baki', 'baakii', 'bakki'],
    'sakkiyo': ['sakkiyo', 'sakiyo', 'sakiyoo', 'sakkyo'],

    'kinchu': ['kinchu', 'kinchhu', 'kinxu', 'kinchuu', 'kinnchu'],
    'linu': ['linu', 'linuu', 'lini', 'liinu'],
    'order': ['order', 'ordar', 'odar', 'odder'],
    'book': ['book', 'buk', 'buuk', 'boook'],
    'chahiyo': ['chahiyo', 'chaiyo', 'chahiyo', 'chaiyoo', 'chahiyoo'],
    'dinus': ['dinus', 'dinoos', 'dinus', 'dinuos'],

    'wholesale': ['wholesale', 'wholsale', 'holesale', 'wholsail', 'holsale'],
    'supplier': ['supplier', 'supalier', 'suplier', 'suuplier'],
    'bulk': ['bulk', 'bulck', 'bluk'],
    'maal': ['maal', 'mal', 'maall', 'mawl'],
    'supply': ['supply', 'supli', 'suppli', 'suplai'],

    'namaste': ['namaste', 'namasthe', 'namastey', 'namasté', 'nmaste'],
    'bhai': ['bhai', 'vai', 'bhaii', 'vaii', 'bhi'],
    'didi': ['didi', 'dede', 'didii', 'dii'],
    'dai': ['dai', 'daii', 'daai', 'dye'],
};

const reverseMap = {};
for (const [canonical, variants] of Object.entries(variantMap)) {
    for (const variant of variants) {
        reverseMap[variant] = canonical;
    }
}

function normalize(text) {
    if (!text) return '';

    let cleaned = text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const words = cleaned.split(' ');
    const normalized = words.map(word => reverseMap[word] || word);

    return normalized.join(' ');
}

module.exports = { normalize };