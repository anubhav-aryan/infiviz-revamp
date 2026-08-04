import { Icon } from "@/app/_components/icon";
import { CATALOG_HEADER, CATEGORIES, type Category } from "../_data/catalog";
import styles from "./catalog.module.css";

type CatalogOverviewProps = {
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
          <span className={styles.statValue}>{category.packshot}%</span>
          <span className={styles.statLabel}>Pack-shots</span>
        </span>
      </span>
    </>
  );
}

export function CatalogOverview({ onOpenCategory }: CatalogOverviewProps) {
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

        <span className={styles.updatedBadge}>
          <Icon
            name="check-circle-2"
            className={styles.updatedBadgeIcon}
            aria-hidden="true"
          />
          {CATALOG_HEADER.updated}
        </span>
      </div>

      <div className={styles.categoryGrid}>
        {CATEGORIES.map((category) =>
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
