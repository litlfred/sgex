/**
 * DAK Version Question Component
 * Returns the version of the DAK from sushi-config.yaml
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { QuestionDefinition, QuestionResult, CacheHint, QuestionLevel } from '../../types/QuestionDefinition.js';
import yaml from 'js-yaml';

// Question metadata
export const metadata = new QuestionDefinition({
  id: 'dak-version',
  level: QuestionLevel.DAK,
  title: 'DAK Version',
  description: 'Extracts the version of the DAK from sushi-config.yaml',
  parameters: [],
  tags: ['dak', 'metadata', 'version'],
  version: '1.0.0'
});

/**
 * Execute the DAK version question
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
        structured: { version: null },
        narrative: getLocalizedNarrative(locale, 'file_not_found'),
        errors: [getLocalizedError(locale, 'sushi_config_missing')],
        meta: {
          cacheHint: new CacheHint({
            scope: 'repository',
            key: 'dak-version',
            ttl: 3600,
            dependencies: ['sushi-config.yaml']
          })
        }
      });
    }

    // Read and parse sushi-config.yaml
    const sushiConfigContent = await storage.readFile('sushi-config.yaml');
    const sushiConfig = yaml.load(sushiConfigContent.toString('utf-8'));

    // Extract DAK version
    let version = null;
    let status = null;
    let releaseDate = null;

    if (sushiConfig && typeof sushiConfig === 'object') {
      version = sushiConfig.version;
      status = sushiConfig.status;
      releaseDate = sushiConfig.releaseDate || sushiConfig.date;
    }

    if (!version) {
      warnings.push(getLocalizedError(locale, 'version_not_found'));
    }

    // Parse semantic version if available
    let semanticVersion = null;
    if (version && typeof version === 'string') {
      const semverMatch = version.match(/^(\d+)\.(\d+)\.(\d+)(-(.+))?$/);
      if (semverMatch) {
        semanticVersion = {
          major: parseInt(semverMatch[1]),
          minor: parseInt(semverMatch[2]),
          patch: parseInt(semverMatch[3]),
          prerelease: semverMatch[5] || null,
          raw: version
        };
      }
    }

    return new QuestionResult({
      structured: { 
        version,
        semanticVersion,
        status,
        releaseDate,
        name: sushiConfig?.name,
        id: sushiConfig?.id
      },
      narrative: getLocalizedNarrative(locale, 'success', { version, status, releaseDate }),
      warnings,
      errors,
      meta: {
        cacheHint: new CacheHint({
          scope: 'repository',
          key: 'dak-version',
          ttl: 3600,
          dependencies: ['sushi-config.yaml']
        })
      }
    });

  } catch (error) {
    return new QuestionResult({
      structured: { version: null },
      narrative: getLocalizedNarrative(locale, 'error'),
      errors: [getLocalizedError(locale, 'parse_error', { error: error.message })],
      meta: {
        cacheHint: new CacheHint({
          scope: 'repository',
          key: 'dak-version',
          ttl: 60, // Short cache on error
          dependencies: ['sushi-config.yaml']
        })
      }
    });
  }
}

/**
 * React component for rendering DAK version narrative
 */
export function Render({ result, locale = 'en_US' }) {
  const { t } = useTranslation();

  if (!result || !result.structured) {
    return <div className="faq-answer error">{t('dak.faq.version.no_data')}</div>;
  }

  const { version, semanticVersion, status, releaseDate } = result.structured;

  if (!version) {
    return (
      <div className="faq-answer warning">
        <h4>{t('dak.faq.version.title')}</h4>
        <p>{t('dak.faq.version.not_found')}</p>
        {result.errors?.map((error, index) => (
          <div key={index} className="error-message">{error}</div>
        ))}
      </div>
    );
  }

  return (
    <div className="faq-answer success">
      <h4>{t('dak.faq.version.title')}</h4>
      <div className="version-metadata">
        <div className="version-info">
          <strong>{t('dak.faq.version.version_label')}: </strong>
          <span className="highlight version-number">{version}</span>
          {semanticVersion && (
            <div className="semantic-version">
              <small>
                Major: {semanticVersion.major}, 
                Minor: {semanticVersion.minor}, 
                Patch: {semanticVersion.patch}
                {semanticVersion.prerelease && ` (${semanticVersion.prerelease})`}
              </small>
            </div>
          )}
        </div>
        {status && (
          <div className="version-status">
            <strong>{t('dak.faq.version.status_label')}: </strong>
            <span className={`status ${status.toLowerCase()}`}>{status}</span>
          </div>
        )}
        {releaseDate && (
          <div className="release-date">
            <strong>{t('dak.faq.version.release_date_label')}: </strong>
            <time>{new Date(releaseDate).toLocaleDateString(locale.replace('_', '-'))}</time>
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
      success: (() => {
        if (!params.version) return `<h4>DAK Version</h4><p>No version found in sushi-config.yaml.</p>`;
        let html = `<h4>DAK Version</h4><p>This DAK is version <strong>${params.version}</strong>.</p>`;
        if (params.status) html += `<p>Status: <span class="status">${params.status}</span></p>`;
        if (params.releaseDate) html += `<p>Released: ${new Date(params.releaseDate).toLocaleDateString()}</p>`;
        return html;
      })(),
      file_not_found: `<h4>DAK Version</h4><p class="error">The sushi-config.yaml file was not found in this repository.</p>`,
      error: `<h4>DAK Version</h4><p class="error">An error occurred while reading the DAK configuration.</p>`
    },
    fr_FR: {
      success: (() => {
        if (!params.version) return `<h4>Version DAK</h4><p>Aucune version trouvée dans sushi-config.yaml.</p>`;
        let html = `<h4>Version DAK</h4><p>Ce DAK est la version <strong>${params.version}</strong>.</p>`;
        if (params.status) html += `<p>Statut: <span class="status">${params.status}</span></p>`;
        if (params.releaseDate) html += `<p>Publié: ${new Date(params.releaseDate).toLocaleDateString('fr-FR')}</p>`;
        return html;
      })(),
      file_not_found: `<h4>Version DAK</h4><p class="error">Le fichier sushi-config.yaml n'a pas été trouvé dans ce référentiel.</p>`,
      error: `<h4>Version DAK</h4><p class="error">Une erreur s'est produite lors de la lecture de la configuration DAK.</p>`
    },
    es_ES: {
      success: (() => {
        if (!params.version) return `<h4>Versión DAK</h4><p>No se encontró versión en sushi-config.yaml.</p>`;
        let html = `<h4>Versión DAK</h4><p>Este DAK es la versión <strong>${params.version}</strong>.</p>`;
        if (params.status) html += `<p>Estado: <span class="status">${params.status}</span></p>`;
        if (params.releaseDate) html += `<p>Lanzado: ${new Date(params.releaseDate).toLocaleDateString('es-ES')}</p>`;
        return html;
      })(),
      file_not_found: `<h4>Versión DAK</h4><p class="error">El archivo sushi-config.yaml no se encontró en este repositorio.</p>`,
      error: `<h4>Versión DAK</h4><p class="error">Ocurrió un error al leer la configuración del DAK.</p>`
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
      version_not_found: 'No version field found in sushi-config.yaml',
      parse_error: `Failed to parse sushi-config.yaml: ${params.error || 'Unknown error'}`
    },
    fr_FR: {
      sushi_config_missing: 'Fichier sushi-config.yaml non trouvé',
      version_not_found: 'Aucun champ version trouvé dans sushi-config.yaml',
      parse_error: `Échec de l'analyse de sushi-config.yaml: ${params.error || 'Erreur inconnue'}`
    },
    es_ES: {
      sushi_config_missing: 'Archivo sushi-config.yaml no encontrado',
      version_not_found: 'No se encontró campo de versión en sushi-config.yaml',
      parse_error: `Error al analizar sushi-config.yaml: ${params.error || 'Error desconocido'}`
    }
  };

  const localeData = errors[locale] || errors['en_US'];
  return localeData[type] || `Unknown error: ${type}`;
}