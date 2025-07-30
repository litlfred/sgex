/**
 * Creates a new bpmn:CategoryValue inside a new bpmn:Category
 *
 * @param bpmnFactory
 *
 * @return
 */
export function createCategory(bpmnFactory: BpmnFactory): ModdleElement;

/**
 * Creates a new bpmn:CategoryValue inside a new bpmn:Category
 *
 * @param bpmnFactory
 *
 * @return
 */
export function createCategoryValue(bpmnFactory: BpmnFactory): ModdleElement;

/**
 * Adds category value to definitions
 *
 * @param categoryValue
 * @param category
 * @param definitions
 *
 * @return
 */
export function linkCategoryValue(categoryValue: ModdleElement, category: ModdleElement, definitions: ModdleElement): ModdleElement;

/**
 * Unlink category value from parent
 *
 * @param categoryValue
 *
 * @return
 */
export function unlinkCategoryValue(categoryValue: ModdleElement): ModdleElement;

/**
 * Unlink category from parent
 *
 * @param category
 *
 * @return
 */
export function unlinkCategory(category: ModdleElement): ModdleElement;

type BpmnFactory = import("../../BpmnFactory").default;
export type ModdleElement = any;
