use hdk::prelude::*;
use posts_integrity::*;
#[hdk_extern]
pub fn create_post(post: Post) -> ExternResult<Record> {
    let post_hash = create_entry(&EntryTypes::Post(post.clone()))?;
    let record = get(post_hash.clone(), GetOptions::default())?
        .ok_or(
            wasm_error!(
                WasmErrorInner::Guest(String::from("Could not find the newly created Post"))
            ),
        )?;
    let path = Path::from("all_posts");
    create_link(path.path_entry_hash()?, post_hash.clone(), LinkTypes::AllPosts, ())?;
    Ok(record)
}
#[hdk_extern]
pub fn get_latest_post(original_post_hash: ActionHash) -> ExternResult<Option<Record>> {
    let links = get_links(original_post_hash.clone(), LinkTypes::PostUpdates, None)?;
    let latest_link = links
        .into_iter()
        .max_by(|link_a, link_b| link_a.timestamp.cmp(&link_b.timestamp));
    let latest_post_hash = match latest_link {
        Some(link) => {
            link.target
                .clone()
                .into_action_hash()
                .ok_or(
                    wasm_error!(
                        WasmErrorInner::Guest(String::from("No action hash associated with link"))
                    ),
                )?
        }
        None => original_post_hash.clone(),
    };
    get(latest_post_hash, GetOptions::default())
}
#[hdk_extern]
pub fn get_original_post(
    original_post_hash: ActionHash,
) -> ExternResult<Option<Record>> {
    let Some(details) = get_details(original_post_hash, GetOptions::default())? else {
        return Ok(None);
    };
    match details {
        Details::Record(details) => Ok(Some(details.record)),
        _ => {
            Err(
                wasm_error!(
                    WasmErrorInner::Guest(String::from("Malformed get details response"))
                ),
            )
        }
    }
}
#[hdk_extern]
pub fn get_all_revisions_for_post(
    original_post_hash: ActionHash,
) -> ExternResult<Vec<Record>> {
    let Some(original_record) = get_original_post(original_post_hash.clone())? else {
        return Ok(vec![]);
    };
    let links = get_links(original_post_hash.clone(), LinkTypes::PostUpdates, None)?;
    let get_input: Vec<GetInput> = links
        .into_iter()
        .map(|link| Ok(
            GetInput::new(
                link
                    .target
                    .into_action_hash()
                    .ok_or(
                        wasm_error!(
                            WasmErrorInner::Guest(String::from("No action hash associated with link"))
                        ),
                    )?
                    .into(),
                GetOptions::default(),
            ),
        ))
        .collect::<ExternResult<Vec<GetInput>>>()?;
    let records = HDK.with(|hdk| hdk.borrow().get(get_input))?;
    let mut records: Vec<Record> = records.into_iter().filter_map(|r| r).collect();
    records.insert(0, original_record);
    Ok(records)
}
#[derive(Serialize, Deserialize, Debug)]
pub struct UpdatePostInput {
    pub original_post_hash: ActionHash,
    pub previous_post_hash: ActionHash,
    pub updated_post: Post,
}
#[hdk_extern]
pub fn update_post(input: UpdatePostInput) -> ExternResult<Record> {
    let updated_post_hash = update_entry(
        input.previous_post_hash.clone(),
        &input.updated_post,
    )?;
    create_link(
        input.original_post_hash.clone(),
        updated_post_hash.clone(),
        LinkTypes::PostUpdates,
        (),
    )?;
    let record = get(updated_post_hash.clone(), GetOptions::default())?
        .ok_or(
            wasm_error!(
                WasmErrorInner::Guest(String::from("Could not find the newly updated Post"))
            ),
        )?;
    Ok(record)
}
