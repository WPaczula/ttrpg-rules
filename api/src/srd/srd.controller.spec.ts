import { Test, TestingModule } from '@nestjs/testing';
import { SrdController } from './srd.controller';
import { SrdService } from './srd.service';
import {
  createMockWeapon,
  createMockArmor,
  createMockClass,
  createMockAncestry,
  createMockCommunity,
  createMockSubclass,
  createMockDomain,
  createMockDomainCard,
} from './testing/mocks';

const mockWeapons = [createMockWeapon()];
const mockArmor = [createMockArmor()];
const mockClasses = [createMockClass()];
const mockAncestries = [createMockAncestry()];
const mockCommunities = [createMockCommunity()];
const mockSubclasses = [createMockSubclass()];
const mockDomains = [createMockDomain()];
const mockDomainCards = [createMockDomainCard()];

const mockSrdService = {
  findAllWeapons: jest.fn().mockReturnValue(mockWeapons),
  findAllArmor: jest.fn().mockReturnValue(mockArmor),
  findAllClasses: jest.fn().mockReturnValue(mockClasses),
  findAllAncestries: jest.fn().mockReturnValue(mockAncestries),
  findAllCommunities: jest.fn().mockReturnValue(mockCommunities),
  findAllSubclasses: jest.fn().mockReturnValue(mockSubclasses),
  findAllDomains: jest.fn().mockReturnValue(mockDomains),
  findAllDomainCards: jest.fn().mockReturnValue(mockDomainCards),
};

describe('SrdController', () => {
  let controller: SrdController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SrdController],
      providers: [{ provide: SrdService, useValue: mockSrdService }],
    }).compile();

    controller = module.get<SrdController>(SrdController);
  });

  it('should return weapons from service', () => {
    const result = controller.findAllWeapons();
    expect(mockSrdService.findAllWeapons).toHaveBeenCalled();
    expect(result).toEqual(mockWeapons);
  });

  it('should return armor from service', () => {
    const result = controller.findAllArmor();
    expect(mockSrdService.findAllArmor).toHaveBeenCalled();
    expect(result).toEqual(mockArmor);
  });

  it('should return classes from service', () => {
    const result = controller.findAllClasses();
    expect(mockSrdService.findAllClasses).toHaveBeenCalled();
    expect(result).toEqual(mockClasses);
  });

  it('should return ancestries from service', () => {
    const result = controller.findAllAncestries();
    expect(mockSrdService.findAllAncestries).toHaveBeenCalled();
    expect(result).toEqual(mockAncestries);
  });

  it('should return communities from service', () => {
    const result = controller.findAllCommunities();
    expect(mockSrdService.findAllCommunities).toHaveBeenCalled();
    expect(result).toEqual(mockCommunities);
  });

  it('should return subclasses from service', () => {
    const result = controller.findAllSubclasses();
    expect(mockSrdService.findAllSubclasses).toHaveBeenCalled();
    expect(result).toEqual(mockSubclasses);
  });

  it('should return domains from service', () => {
    const result = controller.findAllDomains();
    expect(mockSrdService.findAllDomains).toHaveBeenCalled();
    expect(result).toEqual(mockDomains);
  });

  it('should return domain cards from service', () => {
    const result = controller.findAllDomainCards();
    expect(mockSrdService.findAllDomainCards).toHaveBeenCalled();
    expect(result).toEqual(mockDomainCards);
  });
});
