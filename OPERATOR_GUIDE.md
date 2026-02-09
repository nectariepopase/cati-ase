# Ghid de Utilizare - Sistem CATI pentru Operatori

## Autentificare

1. Accesați aplicația în browser la adresa: `http://localhost:3000`
2. Introduceți datele de autentificare:
   - **Utilizator**: `alexandra` sau `nectarie`
   - **Parolă**: `1234`
3. Click pe butonul **Autentificare**

## Realizarea unui Sondaj

### Pasul 1: Căutare Firmă după CUI

1. În câmpul **CUI Firmă**, introduceți CUI-ul firmei pe care o sunați
2. Click pe butonul **Caută**
3. Sistemul va prelua automat:
   - Numele firmei
   - Localitatea
   - Județul
   - Codul CAEN principal

**Notă**: Dacă CUI-ul nu este găsit, verificați corectitudinea și încercați din nou.

### Pasul 2: Întrebarea 1 - Verificare Administrator

**Întrebare**: "Sunteți administratorul societății [Nume Firmă]?"

- Click pe butonul **DA** dacă persoana confirmă
- Click pe butonul **NU** dacă persoana nu este administrator (sondajul se încheie)

### Pasul 3: Întrebările 2-7

Odată ce persoana a confirmat că este administrator, vor apărea toate cele 7 întrebări:

#### Întrebarea 2: Procent Cheltuieli Contabil
**Text**: "Aproximativ, ce procent din cheltuielile lunare actuale ale firmei este reprezentat de onorariul contabilului?"

**Opțiuni**:
- 0-10%
- 11-30%
- 31-50%
- 51-70%
- 71-100%
- Răspuns deschis

**Acțiune**: Click pe butonul corespunzător răspunsului primit.

#### Întrebarea 3: Impediment Contabil
**Text**: "Pe o scară de la 1 la 5 (1 - deloc, 5 - foarte mult), în ce măsură obligativitatea de a avea un contabil autorizat a reprezentat un impediment în decizia de a porni afacerea?"

**Opțiuni**: Butoane de la 1 la 5
- 1 = Deloc
- 5 = Foarte mult

**Acțiune**: Click pe butonul cu scorul menționat.

#### Întrebarea 4: Justificare Obligativitate
**Text**: "Pe o scară de la 1 la 5, în ce măsură considerați întemeiată cerința legală ca situațiile financiare ale microîntreprinderilor să fie semnate doar de un expert contabil autorizat?"

**Opțiuni**: Butoane de la 1 la 5
- 1 = Deloc justificată
- 5 = Foarte justificată

**Acțiune**: Click pe butonul cu scorul menționat.

#### Întrebarea 5: Capabilitate Contabilitate Proprie
**Text**: "Pe o scară de la 1 la 5, cât de capabil v-ați simți să vă țineți contabilitatea în regim propriu și să depuneți singur declarațiile fiscale (fără contabil), dacă legea ar permite acest lucru?"

**Opțiuni**: Butoane de la 1 la 5
- 1 = Deloc capabil
- 5 = Foarte capabil

**Acțiune**: Click pe butonul cu scorul menționat.

#### Întrebarea 6: Influență Costuri
**Text**: "În ce măsură considerați că nivelul costurilor cu serviciile de contabilitate influențează bugetul disponibil pentru alte direcții? (de exemplu marketing, stocuri etc)"

**Opțiuni**:
- Deloc
- Puțin
- Moderat
- Mult
- Foarte mult

**Acțiune**: Click pe butonul corespunzător răspunsului primit.

#### Întrebarea 7: Sumă Lunară
**Text**: "Ce sumă medie lunară plătiți pentru contabilitate?"

**Acțiune**: Introduceți suma menționată în câmpul text (ex: "300 RON", "250-300 RON", "aproximativ 400 lei").

### Pasul 4: Trimitere Sondaj

1. După ce ați completat toate cele 7 întrebări, click pe butonul verde **Trimite Sondaj**
2. Datele vor fi salvate automat în baza de date
3. Veți vedea un mesaj de confirmare: "Date trimise pentru [Nume Firmă]"

### Pasul 5: Sondaj Nou

1. După confirmarea trimiterii, click pe butonul verde **Sondaj Nou**
2. Formularul se resetează automat
3. Puteți introduce un nou CUI pentru următorul sondaj

## Sfaturi și Recomandări

### Pentru o Eficiență Maximă

1. **Pregătire**: Aveți CUI-ul firmei pregătit înainte de a începe apelul
2. **Rapiditate**: Folosiți butoanele mari pentru a selecta rapid răspunsurile
3. **Claritate**: Citiți exact întrebările așa cum sunt formulate în sistem
4. **Verificare**: Înainte de a trimite, asigurați-vă că toate întrebările sunt completate

### Gestionarea Situațiilor Speciale

**Dacă persoana nu știe răspunsul exact**:
- Pentru întrebările cu procente sau intervale: alegeți opțiunea "Răspuns deschis" și notați ce a menționat
- Pentru sumă lunară: scrieți exact ce a spus persoana (ex: "circa 300", "între 200-400")

**Dacă persoana refuză să răspundă**:
- Nu trimiteți sondajul incomplet
- Click pe logo/deconectare și începeți un nou sondaj

**Dacă CUI-ul nu este găsit**:
- Verificați cu persoana corectitudinea CUI-ului
- Încercați fără prefix "RO"
- Dacă problema persistă, notați manual datele firmei

## Deconectare

Click pe butonul **Deconectare** din colțul dreapta-sus pentru a vă deconecta din sistem.

## Suport Tehnic

În caz de probleme tehnice:
1. Reîncărcați pagina (F5)
2. Verificați conexiunea la internet
3. Contactați administratorul de sistem
