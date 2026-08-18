import { Icon } from "@/app/_components/icon";
import {
  CATALOG_HEADER,
  CATEGORIES,
  categoryCsv,
  type Category,
} from "../_data/catalog";
import { ExportButton } from "@/app/_export/export-button";
import styles from "./catalog.module.css";

type CatalogOverviewProps = {
  /** Already narrowed by the search — this component does not filter. */
  categories: Category[];
  query: string;
  onQueryChange: (query: string) => void;
  onOpenCategory: () => void;
};

/** Card body is identical either way; only the wrapper element differs. */
function CategoryCardBody({ category }: { category: Category }) {
  return (
    <>
      <span className={styles.categoryHead}>
        <span className={styles.categoryIdent}>
          <span className={styles.categoryIcon} aria-hidden="true">
            <Icon name={category.icon} size={24} />
          </span>
          <span>
            <span className={styles.categoryName}>{category.name}</span>
            <span className={styles.categoryUpdated}>
              Updated {category.updated}
            </span>
          </span>
        </span>

        {category.openable ? (
          <span className={styles.browse}>
            Browse
            <Icon name="arrow-right" />
          </span>
        ) : null}
      </span>

      <span className={styles.statGrid}>
        <span>
          <span className={styles.statValue}>{category.skus}</span>
          <span className={styles.statLabel}>SKUs</span>
        </span>
        <span>
          <span className={styles.statValue}>{category.brands}</span>
          <span className={styles.statLabel}>Brands</span>
        </span>
        <span>
          <span className={styles.statValue}>{category.subs}</span>
          <span className={styles.statLabel}>Sub-categories</span>
        </span>
        <span>
          <span className={styles.statValue} data-low={category.packshot < 80}>
            {category.packshot}%
          </span>
          <span className={styles.statLabel}>Pack-shots</span>
        </span>
      </span>
    </>
  );
}

export function CatalogOverview({
  categories,
  query,
  onQueryChange,
  onOpenCategory,
}: CatalogOverviewProps) {
  return (
    <div className={styles.overview}>
      <div className={styles.overviewHead}>
        <div>
          <div className={styles.eyebrow}>Catalog</div>
          <h1 className={styles.overviewTitle}>Your product catalog</h1>
          <div className={styles.overviewSubtitle}>
            {CATALOG_HEADER.subtitle}
          </div>
        </div>

        <div className={styles.overviewTools}>
          {/* Same treatment as the SKU search inside a category, so the two
              searches on this surface do not look like different features. */}
          <div className={styles.search}>
            <Icon name="search" aria-hidden="true" />
            <input
              type="search"
              className={styles.searchInput}
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search categories…"
              aria-label="Search categories"
            />
          </div>

          {/* The category summary, so export works from this screen too rather
              than only from inside a category. */}
          <ExportButton
            table={categoryCsv(CATEGORIES)}
            filename="catalog-categories"
            className={styles.exportButton}
          />
          <span className={styles.updatedBadge}>
            <Icon
              name="check-circle-2"
              className={styles.updatedBadgeIcon}
              aria-hidden="true"
            />
            {CATALOG_HEADER.updated}
          </span>
        </div>
      </div>

      {categories.length === 0 ? (
        <p className={styles.overviewEmpty}>
          No category matches &ldquo;{query}&rdquo;.
        </p>
      ) : null}

      <div className={styles.categoryGrid}>
        {categories.map((category) =>
          category.openable ? (
            <button
              key={category.name}
              type="button"
              className={`${styles.reset} ${styles.categoryCard}`}
              data-openable="true"
              onClick={onOpenCategory}
              aria-label={`Browse ${category.name}`}
            >
              <CategoryCardBody category={category} />
            </button>
          ) : (
            // Toothbrush has nothing to drill into yet, so it stays inert.
            <div
              key={category.name}
              className={styles.categoryCard}
              data-openable="false"
            >
              <CategoryCardBody category={category} />
            </div>
          ),
        )}
      </div>
    </div>
  );
}
