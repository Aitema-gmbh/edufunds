import {
  generateAntrag,
  generateMockAntrag,
  generateAntragWithOpenAI,
  isOpenAIAvailable,
  ProjektDaten,
} from '@/lib/ki-antrag-generator';
import type { Foerderprogramm } from '@/types/foerderprogramm';
import testData from '@/mocks/test-programme.json';

// Mock fetch für OpenAI-Tests
global.fetch = jest.fn();

describe('KI-Antrag-Generator', () => {
  let mockProgramm: Foerderprogramm;
  let mockProjektDaten: ProjektDaten;

  beforeEach(() => {
    mockProgramm = testData.gueltigeProgramme[0] as Foerderprogramm;
    mockProjektDaten = testData.gueltigeProjektDaten as ProjektDaten;
    jest.clearAllMocks();
  });

  describe('isOpenAIAvailable', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it('sollte true zurückgeben wenn API-Key gesetzt ist', () => {
      process.env.OPENAI_API_KEY = 'test-api-key';
      expect(isOpenAIAvailable()).toBe(true);
    });

    it('sollte false zurückgeben wenn API-Key nicht gesetzt ist', () => {
      process.env.OPENAI_API_KEY = '';
      expect(isOpenAIAvailable()).toBe(false);
    });

    it('sollte false zurückgeben wenn API-Key undefined ist', () => {
      delete process.env.OPENAI_API_KEY;
      expect(isOpenAIAvailable()).toBe(false);
    });
  });

  describe('generateMockAntrag', () => {
    it('sollte einen vollständigen Antrag generieren', () => {
      const antrag = generateMockAntrag(mockProgramm, mockProjektDaten);
      
      expect(antrag).toBeTruthy();
      expect(antrag).toContain('# FÖRDERANTRAG');
      expect(antrag).toContain(mockProjektDaten.projekttitel);
      expect(antrag).toContain(mockProjektDaten.schulname);
    });

    it('sollte den Projekttitel enthalten', () => {
      const antrag = generateMockAntrag(mockProgramm, mockProjektDaten);
      expect(antrag).toContain('Digitalisierung des Kunstunterrichts');
    });

    it('sollte den Schulnamen enthalten', () => {
      const antrag = generateMockAntrag(mockProgramm, mockProjektDaten);
      expect(antrag).toContain('Gymnasium Musterstadt');
    });

    it('sollte den beantragten Betrag formatiert enthalten', () => {
      const antrag = generateMockAntrag(mockProgramm, mockProjektDaten);
      expect(antrag).toContain('25.000');
    });

    it('sollte alle Abschnitte enthalten', () => {
      const antrag = generateMockAntrag(mockProgramm, mockProjektDaten);
      
      expect(antrag).toContain('1. EINLEITUNG');
      expect(antrag).toContain('2. PROJEKTBESCHREIBUNG');
      expect(antrag).toContain('3. PROJEKTUMSETZUNG');
      expect(antrag).toContain('4. PASSUNG ZUM FÖRDERPROGRAMM');
      expect(antrag).toContain('5. ERWARTETE ERGEBNISSE');
      expect(antrag).toContain('6. NACHHALTIGKEIT');
      expect(antrag).toContain('7. BUDGETÜBERSICHT');
      expect(antrag).toContain('8. ABSCHLUSS');
    });
  });

  describe('Template-Auswahl', () => {
    it('sollte das Bundes-Template für bundesweite Programme verwenden', () => {
      const bundProgramm = testData.gueltigeProgramme.find(p => p.foerdergeberTyp === 'bund') as Foerderprogramm;
      const antrag = generateMockAntrag(bundProgramm, mockProjektDaten);
      
      expect(antrag).toContain('Bundesförderprogramm');
      expect(antrag).toContain('nationaler Ebene');
    });

    it('sollte das Landes-Template für Landesprogramme verwenden', () => {
      const landProgramm = testData.gueltigeProgramme.find(p => p.foerdergeberTyp === 'land') as Foerderprogramm;
      const antrag = generateMockAntrag(landProgramm, mockProjektDaten);
      
      expect(antrag).toContain('landespolitischen Initiativen');
      expect(antrag).toContain('Landes');
    });

    it('sollte das Stiftungs-Template für Stiftungsprogramme verwenden', () => {
      const stiftungProgramm = testData.gueltigeProgramme.find(p => p.foerdergeberTyp === 'stiftung') as Foerderprogramm;
      const antrag = generateMockAntrag(stiftungProgramm, mockProjektDaten);
      
      expect(antrag).toContain('Stiftung');
      expect(antrag).toContain('philanthropischen Ziele');
    });

    it('sollte das EU-Template für EU-Programme verwenden', () => {
      const euProgramm = testData.gueltigeProgramme.find(p => p.foerdergeberTyp === 'eu') as Foerderprogramm;
      const antrag = generateMockAntrag(euProgramm, mockProjektDaten);
      
      expect(antrag).toContain('EU-Programm');
      expect(antrag).toContain('europäische');
    });

    it('sollte das Default-Template für sonstige Programme verwenden', () => {
      const sonstigeProgramm: Foerderprogramm = {
        ...mockProgramm,
        foerdergeberTyp: 'sonstige',
      };
      const antrag = generateMockAntrag(sonstigeProgramm, mockProjektDaten);
      
      expect(antrag).toContain('Förderpartner');
    });
  });

  describe('Formatierung', () => {
    it('sollte Projektdaten korrekt formatieren', () => {
      const antrag = generateMockAntrag(mockProgramm, mockProjektDaten);
      
      expect(antrag).toContain(mockProjektDaten.ziele);
      expect(antrag).toContain(mockProjektDaten.zielgruppe);
      expect(antrag).toContain(mockProjektDaten.zeitraum);
    });

    it('sollte Listen formatieren', () => {
      const antrag = generateMockAntrag(mockProgramm, mockProjektDaten);
      
      // Sollte formatierte Listen enthalten
      expect(antrag).toContain('-');
    });

    it('sollte das Datum formatieren', () => {
      const antrag = generateMockAntrag(mockProgramm, mockProjektDaten);
      
      expect(antrag).toContain('Generiert am:');
    });

    it('sollte den Fördergeber korrekt anzeigen', () => {
      const antrag = generateMockAntrag(mockProgramm, mockProjektDaten);
      
      expect(antrag).toContain(mockProgramm.foerdergeber);
      expect(antrag).toContain(mockProgramm.name);
    });
  });

  describe('Kategorien-Verarbeitung', () => {
    it('sollte Kategorien in den Antrag einbauen', () => {
      const antrag = generateMockAntrag(mockProgramm, mockProjektDaten);
      
      const kategorienText = mockProgramm.kategorien
        .map(k => k.charAt(0).toUpperCase() + k.slice(1).replace(/-/g, ' '))
        .join(', ');
      
      expect(antrag).toContain(kategorienText);
    });

    it('sollte die erste Kategorie im Passungsabschnitt verwenden', () => {
      const antrag = generateMockAntrag(mockProgramm, mockProjektDaten);
      
      expect(antrag).toContain(mockProgramm.kategorien[0]);
    });
  });

  describe('Budget-Darstellung', () => {
    it('sollte den Förderbetrag korrekt formatieren', () => {
      const antrag = generateMockAntrag(mockProgramm, mockProjektDaten);
      
      // Betrag sollte mit Tausenderpunkt formatiert sein
      expect(antrag).toMatch(/25\.000/);
    });

    it('sollte Budget-Positionen enthalten', () => {
      const antrag = generateMockAntrag(mockProgramm, mockProjektDaten);
      
      expect(antrag).toContain('Beantragte Förderung');
      expect(antrag).toContain('Programm');
      expect(antrag).toContain('Fördergeber');
    });
  });

  describe('generateAntrag', () => {
    it('sollte Mock-Antrag zurückgeben wenn kein API-Key verfügbar', async () => {
      process.env.OPENAI_API_KEY = '';
      
      const antrag = await generateAntrag(mockProgramm, mockProjektDaten);
      
      expect(antrag).toContain('# FÖRDERANTRAG');
    });

    it('sollte Verzögerung simulieren bei Mock-Generierung', async () => {
      process.env.OPENAI_API_KEY = '';
      const start = Date.now();
      
      await generateAntrag(mockProgramm, mockProjektDaten);
      
      const duration = Date.now() - start;
      expect(duration).toBeGreaterThanOrEqual(100); // Mindestens 100ms Verzögerung
    });
  });

  describe('generateAntragWithOpenAI', () => {
    it('sollte Fehler werfen wenn kein API-Key konfiguriert', async () => {
      await expect(
        generateAntragWithOpenAI(mockProgramm, mockProjektDaten, { apiKey: '' })
      ).rejects.toThrow('OpenAI API Key nicht konfiguriert');
    });

    it('sollte OpenAI-API aufrufen wenn Key verfügbar', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Generierter Antragstext'
          }
        }]
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await generateAntragWithOpenAI(
        mockProgramm, 
        mockProjektDaten, 
        { apiKey: 'test-key' }
      );

      expect(fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-key',
          }),
        })
      );
      expect(result).toBe('Generierter Antragstext');
    });

    it('sollte auf Mock-Generierung zurückfallen bei API-Fehler', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await generateAntragWithOpenAI(
        mockProgramm, 
        mockProjektDaten, 
        { apiKey: 'test-key' }
      );

      expect(result).toContain('# FÖRDERANTRAG');
    });

    it('sollte auf Mock-Generierung zurückfallen bei Netzwerkfehler', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await generateAntragWithOpenAI(
        mockProgramm, 
        mockProjektDaten, 
        { apiKey: 'test-key' }
      );

      expect(result).toContain('# FÖRDERANTRAG');
    });
  });

  describe('Edge Cases', () => {
    it('sollte mit leeren optionalen Feldern umgehen können', () => {
      const minimalProjektDaten: ProjektDaten = {
        schulname: 'Test Schule',
        projekttitel: 'Test Projekt',
        kurzbeschreibung: 'Test',
        ziele: '',
        zielgruppe: '',
        zeitraum: '',
        hauptaktivitaeten: '',
        ergebnisse: '',
        nachhaltigkeit: '',
        foerderbetrag: '10000',
      };

      const antrag = generateMockAntrag(mockProgramm, minimalProjektDaten);
      expect(antrag).toContain('Test Projekt');
      expect(antrag).toContain('Test Schule');
    });

    it('sollte große Zahlen korrekt formatieren', () => {
      const großeProjektDaten: ProjektDaten = {
        ...mockProjektDaten,
        foerderbetrag: '1000000',
      };

      const antrag = generateMockAntrag(mockProgramm, großeProjektDaten);
      expect(antrag).toContain('1.000.000');
    });
  });
});
