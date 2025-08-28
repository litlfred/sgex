/**
 * DAK Name Question Component
 * Returns the name of the DAK from sushi-config.yaml
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { QuestionDefinition, QuestionResult, CacheHint, QuestionLevel } from '../../types/QuestionDefinition.js';
import yaml from 'js-yaml';

// Question metadata
export const metadata = new QuestionDefinition({
  id: 'dak-name',
  level: QuestionLevel.DAK,
  title: 'DAK Name',
  description: 'Extracts the name of the DAK from sushi-config.yaml',
  parameters: [],
  tags: ['dak', 'metadata', 'name'],
  version: '1.0.0'
});

/**
 * Execute the DAK name question
 * @param {Object} input - Question input parameters
 * @param {string} input.repository - Repository identifier
 * @param {string} input.locale - Locale for response
 * @param {string} input.branch - Git branch
 * @param {Storage} input.storage - Storage interface
 * @returns {Promise<QuestionResult>} - Question result
 */
export async function execute(input) {
  const { locale = 'en_US', storage } = input;
  const warnings = [];
  const errors = [];

  try {
    // Check if sushi-config.yaml exists
    const sushiConfigExists = await storage.fileExists('sushi-config.yaml');
    if (!sushiConfigExists) {
      return new QuestionResult({
        structured: { name: null },
        narrative: getLocalizedNarrative(locale, 'file_not_found'),
        errors: [getLocalizedError(locale, 'sushi_config_missing')],
        meta: {
          cacheHint: new CacheHint({
            scope: 'repository',
            key: 'dak-name',
            ttl: 3600,
            dependencies: ['sushi-config.yaml']
          })
        }
      });
    }

    // Read and parse sushi-config.yaml
    const sushiConfigContent = await storage.readFile('sushi-config.yaml');
    const sushiConfig = yaml.load(sushiConfigContent.toString('utf-8'));

    // Extract DAK name
    let dakName = null;
    if (sushiConfig && typeof sushiConfig === 'object') {
      dakName = sushiConfig.name || sushiConfig.title || sushiConfig.id;
    }

    if (!dakName) {
      warnings.push(getLocalizedError(locale, 'name_not_found'));
    }

    return new QuestionResult({
      structured: { 
        name: dakName,
        id: sushiConfig?.id,
        title: sushiConfig?.title,
        version: sushiConfig?.version 
      },
      narrative: getLocalizedNarrative(locale, 'success', { name: dakName }),
      warnings,
      errors,
      meta: {
        cacheHint: new CacheHint({
          scope: 'repository',
          key: 'dak-name',
          ttl: 3600,
          dependencies: ['sushi-config.yaml']
        })
      }
    });

  } catch (error) {
    return new QuestionResult({
      structured: { name: null },
      narrative: getLocalizedNarrative(locale, 'error'),
      errors: [getLocalizedError(locale, 'parse_error', { error: error.message })],
      meta: {
        cacheHint: new CacheHint({
          scope: 'repository',
          key: 'dak-name',
          ttl: 60, // Short cache on error
          dependencies: ['sushi-config.yaml']
        })
      }
    });
  }
}

/**
 * React component for rendering DAK name narrative
 */
export function Render({ result, locale = 'en_US' }) {
  const { t } = useTranslation();

  if (!result || !result.structured) {
    return <div className="faq-answer error">{t('dak.faq.name.no_data')}</div>;
  }

  const { name, id, title, version } = result.structured;

  if (!name) {
    return (
      <div className="faq-answer warning">
        <h4>{t('dak.faq.name.title')}</h4>
        <p>{t('dak.faq.name.not_found')}</p>
        {result.errors?.map((error, index) => (
          <div key={index} className="error-message">{error}</div>
        ))}
      </div>
    );
  }

  return (
    <div className="faq-answer success">
      <h4>{t('dak.faq.name.title')}</h4>
      <div className="dak-metadata">
        <div className="dak-name">
          <strong>{t('dak.faq.name.name_label')}: </strong>
          <span className="highlight">{name}</span>
        </div>
        {id && id !== name && (
          <div className="dak-id">
            <strong>{t('dak.faq.name.id_label')}: </strong>
            <code>{id}</code>
          </div>
        )}
        {title && title !== name && (
          <div className="dak-title">
            <strong>{t('dak.faq.name.title_label')}: </strong>
            {title}
          </div>
        )}
        {version && (
          <div className="dak-version">
            <strong>{t('dak.faq.name.version_label')}: </strong>
            <code>{version}</code>
          </div>
        )}
      </div>
      {result.warnings?.map((warning, index) => (
        <div key={index} className="warning-message">{warning}</div>
      ))}
    </div>
  );
}

/**
 * Get localized narrative text
 */
function getLocalizedNarrative(locale, type, params = {}) {
  const narratives = {
    en_US: {
      success: params.name ? 
        `<h4>DAK Name</h4><p>The name of this DAK is <strong>${params.name}</strong>.</p>` :
        `<h4>DAK Name</h4><p>No name found in sushi-config.yaml.</p>`,
      file_not_found: `<h4>DAK Name</h4><p class="error">The sushi-config.yaml file was not found in this repository.</p>`,
      error: `<h4>DAK Name</h4><p class="error">An error occurred while reading the DAK configuration.</p>`
    },
    fr_FR: {
      success: params.name ?
        `<h4>Nom du DAK</h4><p>Le nom de ce DAK est <strong>${params.name}</strong>.</p>` :
        `<h4>Nom du DAK</h4><p>Aucun nom trouvé dans sushi-config.yaml.</p>`,
      file_not_found: `<h4>Nom du DAK</h4><p class="error">Le fichier sushi-config.yaml n'a pas été trouvé dans ce référentiel.</p>`,
      error: `<h4>Nom du DAK</h4><p class="error">Une erreur s'est produite lors de la lecture de la configuration DAK.</p>`
    },
    es_ES: {
      success: params.name ?
        `<h4>Nombre del DAK</h4><p>El nombre de este DAK es <strong>${params.name}</strong>.</p>` :
        `<h4>Nombre del DAK</h4><p>No se encontró nombre en sushi-config.yaml.</p>`,
      file_not_found: `<h4>Nombre del DAK</h4><p class="error">El archivo sushi-config.yaml no se encontró en este repositorio.</p>`,
      error: `<h4>Nombre del DAK</h4><p class="error">Ocurrió un error al leer la configuración del DAK.</p>`
    }
  };

  const localeData = narratives[locale] || narratives['en_US'];
  return localeData[type] || localeData.error;
}

/**
 * Get localized error message
 */
function getLocalizedError(locale, type, params = {}) {
  const errors = {
    en_US: {
      sushi_config_missing: 'sushi-config.yaml file not found',
      name_not_found: 'No name field found in sushi-config.yaml',
      parse_error: `Failed to parse sushi-config.yaml: ${params.error || 'Unknown error'}`
    },
    fr_FR: {
      sushi_config_missing: 'Fichier sushi-config.yaml non trouvé',
      name_not_found: 'Aucun champ nom trouvé dans sushi-config.yaml',
      parse_error: `Échec de l'analyse de sushi-config.yaml: ${params.error || 'Erreur inconnue'}`
    },
    es_ES: {
      sushi_config_missing: 'Archivo sushi-config.yaml no encontrado',
      name_not_found: 'No se encontró campo de nombre en sushi-config.yaml',
      parse_error: `Error al analizar sushi-config.yaml: ${params.error || 'Error desconocido'}`
    }
  };

  const localeData = errors[locale] || errors['en_US'];
  return localeData[type] || `Unknown error: ${type}`;
}