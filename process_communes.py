import json

WILAYAS = {
    "1": "01- Adrar", "2": "02- Chlef", "3": "03- Laghouat", "4": "04- Oum El Bouaghi", "5": "05- Batna",
    "6": "06- Béjaïa", "7": "07- Biskra", "8": "08- Béchar", "9": "09- Blida", "10": "10- Bouira",
    "11": "11- Tamanrasset", "12": "12- Tébessa", "13": "13- Tlemcen", "14": "14- Tiaret", "15": "15- Tizi Ouzou",
    "16": "16- Alger", "17": "17- Djelfa", "18": "18- Jijel", "19": "19- Sétif", "20": "20- Saïda",
    "21": "21- Skikda", "22": "22- Sidi Bel Abbès", "23": "23- Annaba", "24": "24- Guelma", "25": "25- Constantine",
    "26": "26- Médéa", "27": "27- Mostaganem", "28": "28- M'Sila", "29": "29- Mascara", "30": "30- Ouargla",
    "31": "31- Oran", "32": "32- El Bayadh", "33": "33- Illizi", "34": "34- Bordj Bou Arréridj", "35": "35- Boumerdès",
    "36": "36- El Tarf", "37": "37- Tindouf", "38": "38- Tissemsilt", "39": "39- El Oued", "40": "40- Khenchela",
    "41": "41- Souك Ahras", "42": "42- Tipaza", "43": "43- Mila", "44": "44- Aïn Defla", "45": "45- Naâma",
    "46": "46- Aïn Témouchent", "47": "47- Ghardaïa", "48": "48- Relizane", "49": "49- El M'Ghair", "50": "50- El Meniaa",
    "51": "51- Ouled Djellal", "52": "52- Bordj Baji Mokhtar", "53": "53- Béni Abbès", "54": "54- Timimoun", "55": "55- Touggourt",
    "56": "56- Djanet", "57": "57- In Salah", "58": "58- In Guezzam"
}

def main():
    try:
        with open("communes.json", "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"Failed to read file: {e}")
        return

    seen = set()
    valid_communes = []
    for item in data:
        w_id = str(item.get("wilaya_id"))
        c_name = item.get("name")
        if w_id in WILAYAS and (w_id, c_name) not in seen:
            seen.add((w_id, c_name))
            valid_communes.append({
                "wilaya_name": WILAYAS[w_id],
                "commune_name": c_name,
                "shipping_cost": 500,
                "is_active": True
            })

    # Sort by wilaya code and then commune name
    valid_communes.sort(key=lambda x: (x["wilaya_name"], x["commune_name"]))

    batch_size = 200
    for i in range(0, len(valid_communes), batch_size):
        batch = valid_communes[i:i + batch_size]
        values = []
        for c in batch:
            name = c["commune_name"].replace("'", "''")
            values.append(f"('{c['wilaya_name']}', '{name}', {c['shipping_cost']}, {str(c['is_active']).lower()})")
        
        sql = "INSERT INTO communes (wilaya_name, commune_name, shipping_cost, is_active) VALUES\n" + ",\n".join(values) + " ON CONFLICT (wilaya_name, commune_name) DO NOTHING;"
        print(f"--- BATCH {i//batch_size + 1}")
        print(sql)
        print("\n")

if __name__ == "__main__":
    main()
